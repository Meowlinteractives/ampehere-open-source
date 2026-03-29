// ===== AMPEHERE AVATAR HELPER v3 =====
// Single responsibility: fetch avatar defs for a username, render with Avatar2D.
// No WebGL dependency. No timing races. Always shows correct skin color.
(function() {
    if (window.AmpAvatar) return;

    var _defsCache = {};  // username -> defs array
    var _itemsCache = null;
    var _itemsPromise = null;

    function fetchItems() {
        if (_itemsCache) return Promise.resolve(_itemsCache);
        if (_itemsPromise) return _itemsPromise;
        _itemsPromise = fetch('/api/avatar/get-items')
            .then(function(r) { return r.ok ? r.json() : {items:[]}; })
            .catch(function() { return {items:[]}; })
            .then(function(d) {
                _itemsCache = d.items || [];
                _itemsPromise = null;
                return _itemsCache;
            });
        return _itemsPromise;
    }

    function fetchDefs(username) {
        if (_defsCache[username] !== undefined) return Promise.resolve(_defsCache[username]);
        return Promise.all([
            fetch('/api/get-profile?username=' + encodeURIComponent(username))
                .then(function(r) { return r.ok ? r.json() : {success:false}; })
                .catch(function() { return {success:false}; }),
            fetchItems()
        ]).then(function(results) {
            var profile = results[0];
            var allItems = results[1];
            var ids = [];
            if (profile && profile.user && profile.user.customization) {
                ids = profile.user.customization.equippedAvatarItems || [];
            }
            var defs = ids.map(function(id) {
                return allItems.find(function(item) { return item.id === id; });
            }).filter(Boolean);
            var hasSkin = defs.some(function(d) { return d.category === 'skin'; });
            if (!hasSkin) { var ds = allItems.find(function(i) { return i.category === 'skin' && i.is_default; }); if (ds) defs.push(ds); }
            _defsCache[username] = defs;
            return defs;
        }).catch(function() {
            _defsCache[username] = [];
            return [];
        });
    }

    function draw(img, defs, size) {
        if (!img || !window.Avatar2D) return;
        size = size || parseInt(img.getAttribute('width')) || 40;
        Avatar2D.renderImg(img, defs || [], size);
    }

    function renderUsername(img, username, size) {
        if (!img || !username) return;
        size = size || parseInt(img.getAttribute('width')) || 40;
        // Draw immediately with whatever we have cached
        draw(img, _defsCache[username] || [], size);
        // Fetch real defs and redraw
        fetchDefs(username).then(function(defs) {
            draw(img, defs, size);
        });
    }

    function waitFor2D(cb) {
        if (window.Avatar2D) { cb(); return; }
        var t = setInterval(function() {
            if (window.Avatar2D) { clearInterval(t); cb(); }
        }, 30);
        setTimeout(function() { clearInterval(t); }, 8000);
    }

    function renderAll(root) {
        root = root || document;
        if (!root.querySelectorAll) return;
        var imgs = root.querySelectorAll('img[data-avuser]:not([data-av-done])');
        imgs.forEach(function(img) {
            img.setAttribute('data-av-done', '1');
            var username = img.getAttribute('data-avuser');
            var size = parseInt(img.getAttribute('width')) || 40;
            waitFor2D(function() { renderUsername(img, username, size); });
        });
    }

    window.AmpAvatar = {
        render: function(img, username, size) {
            img.removeAttribute('data-av-done'); // allow re-render
            waitFor2D(function() { renderUsername(img, username, size); });
        },
        renderDefs: function(img, defs, size) {
            waitFor2D(function() { draw(img, defs, size); });
        },
        renderAll: function(root, size) {
            renderAll(root);
        },
        invalidate: function(username) {
            if (username) delete _defsCache[username];
            else _defsCache = {};
            _itemsCache = null;
            _itemsPromise = null;
        }
    };

    // Auto-observe DOM
    function startObserver() {
        renderAll(document);
        if (!window.MutationObserver) return;
        var observer = new MutationObserver(function(mutations) {
            var hasNew = false;
            for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;
                for (var j = 0; j < added.length; j++) {
                    var node = added[j];
                    if (node.nodeType !== 1) continue;
                    if ((node.matches && node.matches('img[data-avuser]')) ||
                        (node.querySelector && node.querySelector('img[data-avuser]'))) {
                        hasNew = true;
                        break;
                    }
                }
                if (hasNew) break;
            }
            if (hasNew) renderAll(document);
        });
        observer.observe(document.body || document.documentElement, {childList:true, subtree:true});
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startObserver);
    } else {
        setTimeout(startObserver, 0);
    }

    window.currentUsername = window.currentUsername || null;
})();
