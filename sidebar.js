// sidebar.js — topbar + mobile nav

window._ampDetectOS = async function() { return { allowed: true, detectedOS: 'Any' }; };

(function() {
    if (document.getElementById('universal-topbar')) return;

    const _isGamePage = location.pathname === '/game-player.html' || location.pathname.endsWith('/game-player.html');
    if (_isGamePage) return;

    let currentUsername = null, _isLoggedIn = false, _isOwner = false;
    let isAmpere = false, _allItems = [], _equippedIds = [];
    let _lastPendingCount = -1;

    // ── Badge helpers (defined early so other scripts can use them) ──────────
    const _badgeCache = {};
    window.ampNameBadge = async function(username) {
        if (!username) return '';
        if (_badgeCache[username] !== undefined) return _badgeCache[username];
        try {
            const res  = await fetch(`/api/get-profile?username=${encodeURIComponent(username)}`);
            const data = await res.json();
            const badges = data.user?.badges || [];
            let icon = '';
            if (badges.includes('Meowl'))
                icon = `<img src="/images/badge-meowl.png" alt="Meowl" title="Meowl Badge" style="width:20px;height:20px;object-fit:contain;vertical-align:middle;margin-right:4px;filter:drop-shadow(0 1px 3px rgba(0,0,0,.5));">`;
            else if (badges.includes('Admin'))
                icon = `<img src="/images/badge-admin.png" alt="Admin" title="Admin" style="width:20px;height:20px;object-fit:contain;vertical-align:middle;margin-right:4px;filter:drop-shadow(0 1px 3px rgba(0,0,0,.5));">`;
            _badgeCache[username] = icon;
            return icon;
        } catch { _badgeCache[username] = ''; return ''; }
    };
    window.ampNameBadgeBatch = async function(usernames) {
        const uncached = [...new Set(usernames)].filter(u => u && _badgeCache[u] === undefined);
        await Promise.all(uncached.map(u => window.ampNameBadge(u)));
    };

    // ── HTML ─────────────────────────────────────────────────────────────────
    const topbarHTML = `
        <div id="universal-topbar" class="universal-topbar">
            <div class="tb-left">
                <a class="tb-logo" href="/">
                    <img src="/logo.png" alt="Ampehere" onerror="this.style.display='none'">
                    <span class="tb-logo-wordmark">AMPE<span>HERE</span></span>
                </a>
            </div>

            <nav class="tb-nav" id="tb-nav">
                <a class="tb-link" data-page="games"       href="/games.html"><i class="fas fa-gamepad"></i> Games</a>
                <a class="tb-link" data-page="forums"      href="/forums.html"><i class="fas fa-comments"></i> Forums</a>
                <a class="tb-link" data-page="groups"      href="/groups.html"><i class="fas fa-users"></i> Groups</a>
                <a class="tb-link" data-page="users"       href="/users.html"><i class="fas fa-search"></i> People</a>
                <a class="tb-link tb-auth-only" data-page="trades"       href="/trades.html"><i class="fas fa-exchange-alt"></i> Trades</a>
                <a class="tb-link tb-auth-only" data-page="dms"          href="/dms.html"><i class="fas fa-envelope"></i> Messages</a>
                <a class="tb-link tb-auth-only" data-page="ampereplus"   href="/novaplus-shop.html"><img src="/images/ampere-plus-icon.png" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;margin-right:4px;" alt="">Ampehere+</a>
                <a class="tb-link tb-auth-only" data-page="avatar-store" href="/avatar-store.html"><i class="fas fa-cube"></i> Store</a>
                <a class="tb-link tb-owner-only" data-page="announcements" href="/announcements.html" style="display:none"><i class="fas fa-bullhorn"></i> Announce</a>
            </nav>

            <div class="tb-right">
                <div class="tb-stat tb-auth-only" id="tb-coins-pill" onclick="window.location.href='/'" style="cursor:pointer;">
                    <img src="/images/coin-icon.png" alt="coin" style="width:20px;height:20px;object-fit:contain;vertical-align:middle;margin-right:.2em;position:relative;top:-.05em;display:inline-block;">
                    <span id="tb-coins-val">—</span>
                </div>
                <button class="tb-icon-btn tb-auth-only" id="sbBellBtn" onclick="window.toggleNotifPanel()" aria-label="Notifications">
                    <i class="fas fa-bell"></i>
                </button>
                <div class="tb-avatar" id="universalProfileIcon" onclick="window.toggleProfileDropdown()" title="My Profile">
                    <img id="sidebarAvatarImg" width="32" height="32" style="display:block;width:32px;height:32px;border-radius:50%;object-fit:cover;" alt="">
                </div>
                <a class="tb-login-btn tb-guest-only" href="/login.html"><i class="fas fa-sign-in-alt"></i> Log In</a>
                <!-- Hamburger — mobile only -->
                <button class="tb-hamburger" id="tbHamburger" onclick="window.toggleMobileDrawer()" aria-label="Menu">
                    <span></span><span></span><span></span>
                </button>
            </div>

            <!-- Profile dropdown -->
            <div id="tb-profile-dropdown" style="display:none;">
                <div class="tb-dd-header">
                    <div class="tb-dd-avatar"><img id="tbDdAvatarImg" width="44" height="44" style="width:44px;height:44px;border-radius:50%;display:block;object-fit:cover;" alt=""></div>
                    <div class="tb-dd-info">
                        <div class="tb-dd-username" id="tbDdUsername">—</div><div class="tb-dd-badge" id="tbDdBadge" style="margin-top:2px;"></div>
                        <div class="tb-dd-coins"><img src="/images/coin-icon.png" alt="coin" style="width:20px;height:20px;object-fit:contain;vertical-align:middle;margin-right:.2em;position:relative;top:-.05em;display:inline-block;"><span id="tbDdCoins">0</span> coins</div>
                    </div>
                </div>
                <div class="tb-dd-divider"></div>
                <a class="tb-dd-item" id="tbDdProfile" href="#"><i class="fas fa-user"></i> My Profile</a>
                <a class="tb-dd-item" href="/account.html"><i class="fas fa-cog"></i> Settings</a>
                <a class="tb-dd-item" href="/dms.html"><i class="fas fa-envelope"></i> Messages</a>
                <a class="tb-dd-item" href="/trades.html"><i class="fas fa-exchange-alt"></i> Trades</a>
                <a class="tb-dd-item" href="/friends.html"><i class="fas fa-user-friends"></i> Friends</a>
                <a class="tb-dd-item" href="/novaplus-shop.html"><img src="/images/ampere-plus-icon.png" style="width:14px;height:14px;object-fit:contain;vertical-align:middle;margin-right:6px;" alt="">Ampehere+</a>
                <div class="tb-dd-divider"></div>
                <button class="tb-dd-item tb-dd-logout" onclick="window.topbarLogout()"><i class="fas fa-sign-out-alt"></i> Log Out</button>
            </div>
        </div>

        <!-- Mobile drawer overlay -->
        <div id="tb-mobile-overlay" onclick="window.closeMobileDrawer()"></div>

        <!-- Mobile drawer -->
        <div id="tb-mobile-drawer">
            <div class="tmd-header">
                <div class="tmd-user" id="tmdUser" style="display:none;">
                    <div class="tmd-avatar"><img id="tmdAvatarImg" width="40" height="40" style="width:40px;height:40px;border-radius:50%;display:block;" alt=""></div>
                    <div>
                        <div class="tmd-username" id="tmdUsername">—</div>
                        <div class="tmd-coins"><img src="/images/coin-icon.png" alt="coin" style="width:18px;height:18px;object-fit:contain;vertical-align:middle;margin-right:.2em;display:inline-block;"><span id="tmdCoins">0</span> coins</div>
                    </div>
                </div>
                <a class="tmd-login-btn tmd-guest-only" href="/login.html"><i class="fas fa-sign-in-alt"></i> Log In</a>
            </div>
            <div class="tmd-divider"></div>
            <nav class="tmd-nav">
                <a class="tmd-link" href="/"><i class="fas fa-home"></i> Home</a>
                <a class="tmd-link" href="/games.html"><i class="fas fa-gamepad"></i> Games</a>
                <a class="tmd-link" href="/forums.html"><i class="fas fa-comments"></i> Forums</a>
                <a class="tmd-link" href="/groups.html"><i class="fas fa-users"></i> Groups</a>
                <a class="tmd-link" href="/users.html"><i class="fas fa-search"></i> People</a>
                <a class="tmd-link tmd-auth-only" href="/trades.html"><i class="fas fa-exchange-alt"></i> Trades</a>
                <a class="tmd-link tmd-auth-only" href="/dms.html"><i class="fas fa-envelope"></i> Messages</a>
                <a class="tmd-link tmd-auth-only" href="/avatar-store.html"><i class="fas fa-cube"></i> Store</a>
                <a class="tmd-link tmd-auth-only" href="/novaplus-shop.html"><img src="/images/ampere-plus-icon.png" style="width:15px;height:15px;object-fit:contain;vertical-align:middle;margin-right:8px;" alt="">Ampehere+</a>
                <a class="tmd-link tmd-auth-only" href="/friends.html"><i class="fas fa-user-friends"></i> Friends</a>
                <a class="tmd-link tmd-auth-only" href="/account.html"><i class="fas fa-cog"></i> Settings</a>
                <a class="tmd-link tmd-owner-only" href="/announcements.html" style="display:none"><i class="fas fa-bullhorn"></i> Announce</a>
            </nav>
            <div class="tmd-divider tmd-auth-only"></div>
            <button class="tmd-logout tmd-auth-only" onclick="window.topbarLogout()"><i class="fas fa-sign-out-alt"></i> Log Out</button>
        </div>`;

    // ── CSS ───────────────────────────────────────────────────────────────────
    const style = document.createElement('style');
    style.textContent = `
        :root {
            --tb-h: 52px;
            --tb-bg: #000000;
            --tb-border: #1a1a1a;
            --tb-accent: #c0392b;
            --tb-accent-bright: #e74c3c;
            --tb-text: #a0a8b0;
            --tb-text-bright: #ffffff;
            --tb-hover: #0d0d0d;
            --tb-active-bg: rgba(192,57,43,0.12);
            --tb-glass: rgba(255,255,255,0.03);
        }

        /* ── Topbar ── */
        .universal-topbar {
            position: fixed; top: 0; left: 0; right: 0; height: var(--tb-h);
            background: var(--tb-bg);
            border-bottom: 1px solid var(--tb-border);
            display: flex; align-items: center;
            padding: 0 0 0 0; gap: 0;
            z-index: 1000;
            font-family: 'Exo 2', sans-serif;
        }
        /* Subtle red accent line at very top */
        .universal-topbar::before {
            content: '';
            position: absolute; top: 0; left: 0; right: 0; height: 2px;
            background: linear-gradient(90deg, var(--tb-accent) 0%, transparent 60%);
            pointer-events: none;
        }
        body {
            margin-top: var(--tb-h) !important;
            font-family: 'Exo 2', sans-serif;
            min-height: 100vh;
            background: #000000;
            color: #e0e0e0;
        }
        body.sidebar-auth-page .universal-topbar { display: none !important; }
        body.sidebar-auth-page { margin-top: 0 !important; }
        body.default-theme { background: #000000; }

        /* Logo */
        .tb-left {
            display: flex; align-items: center; flex-shrink: 0;
            padding: 0 14px 0 16px;
            height: 100%;
            border-right: 1px solid var(--tb-border);
        }
        .tb-logo { display: flex; align-items: center; text-decoration: none; gap: 8px; }
        .tb-logo img {
            width: 26px; height: 26px; object-fit: contain;
            filter: brightness(0) invert(1);
            transition: opacity 0.2s;
        }
        .tb-logo:hover img { opacity: 0.75; }
        .tb-logo-wordmark {
            font-family: 'Exo 2', sans-serif;
            font-weight: 800;
            font-size: 14px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #fff;
        }
        .tb-logo-wordmark span { color: var(--tb-accent); }

        /* Nav links */
        .tb-nav { display: flex; align-items: center; gap: 0; flex: 1; overflow: hidden; height: 100%; }
        .tb-link {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 0 14px;
            height: 100%;
            color: var(--tb-text);
            font-size: 12px; font-weight: 700;
            text-decoration: none;
            white-space: nowrap;
            transition: color 0.15s, background 0.15s;
            border: none; border-radius: 0;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            position: relative;
        }
        .tb-link i { font-size: 11px; }
        .tb-link::after {
            content: '';
            position: absolute; bottom: 0; left: 14px; right: 14px; height: 2px;
            background: var(--tb-accent);
            transform: scaleX(0);
            transition: transform 0.2s ease;
        }
        .tb-link:hover { color: var(--tb-text-bright); background: var(--tb-glass); text-decoration: none; }
        .tb-link:hover::after { transform: scaleX(1); }
        .tb-link:hover i { color: var(--tb-text-bright); }
        .tb-link.active { color: var(--tb-text-bright); background: var(--tb-active-bg); }
        .tb-link.active::after { transform: scaleX(1); }

        /* Right side */
        .tb-right { display: flex; align-items: center; gap: 2px; margin-left: auto; flex-shrink: 0; padding: 0 10px; height: 100%; border-left: 1px solid var(--tb-border); }
        .tb-stat {
            display: inline-flex; align-items: center; gap: 5px;
            background: transparent;
            border: 1px solid #1c1c1c;
            border-radius: 0;
            padding: 4px 10px;
            font-size: 12px; font-weight: 800; color: #f1c40f; white-space: nowrap;
            cursor: pointer;
            letter-spacing: 0.03em;
            transition: background 0.15s, border-color 0.15s;
        }
        .tb-stat:hover { background: rgba(241,196,15,0.06); border-color: rgba(241,196,15,0.3); }
        .tb-icon-btn {
            width: 34px; height: 34px;
            background: transparent; border: 1px solid #1c1c1c;
            border-radius: 0;
            color: var(--tb-text); font-size: 13px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; position: relative;
            transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .tb-icon-btn:hover { background: var(--tb-hover); color: var(--tb-text-bright); border-color: #333; }
        .tb-avatar {
            width: 34px; height: 34px;
            background: transparent;
            border: 2px solid #222;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; overflow: hidden; flex-shrink: 0;
            transition: border-color 0.15s;
        }
        .tb-avatar:hover { border-color: var(--tb-accent); }
        .tb-avatar.ampere-plus { border-color: var(--tb-accent); box-shadow: 0 0 8px rgba(192,57,43,0.25); }
        .tb-login-btn {
            display: inline-flex; align-items: center; gap: 5px;
            padding: 6px 14px;
            background: var(--tb-accent);
            border: none; border-radius: 0;
            color: #ffffff; font-size: 11px; font-weight: 800;
            text-decoration: none; white-space: nowrap;
            letter-spacing: 0.06em; text-transform: uppercase;
            transition: background 0.15s;
        }
        .tb-login-btn:hover { background: var(--tb-accent-bright); color: #ffffff; text-decoration: none; }

        /* Hamburger */
        .tb-hamburger {
            display: none;
            flex-direction: column; justify-content: center; align-items: center; gap: 5px;
            width: 34px; height: 34px;
            background: transparent; border: 1px solid #1c1c1c; border-radius: 0;
            cursor: pointer; padding: 0; flex-shrink: 0;
            transition: background 0.15s;
        }
        .tb-hamburger span { display: block; width: 16px; height: 1.5px; background: var(--tb-text); border-radius: 0; transition: all .2s; }
        .tb-hamburger:hover { background: var(--tb-hover); }
        .tb-hamburger:hover span { background: var(--tb-text-bright); }
        .tb-hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .tb-hamburger.open span:nth-child(2) { opacity: 0; }
        .tb-hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        /* Profile dropdown */
        #tb-profile-dropdown {
            position: fixed; top: calc(var(--tb-h) + 6px); right: 8px;
            width: 220px;
            background: #060606;
            border: 1px solid #1e1e1e;
            border-top: 2px solid var(--tb-accent);
            box-shadow: 0 16px 48px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.02);
            z-index: 1100; overflow: hidden; flex-direction: column;
        }
        .tb-dd-header {
            display: flex; align-items: center; gap: 12px;
            padding: 14px 14px 12px;
            background: linear-gradient(180deg, #0d0d0d 0%, #080808 100%);
            border-bottom: 1px solid #1a1a1a;
            position: relative;
        }
        .tb-dd-avatar { width: 42px; height: 42px; border-radius: 50%; overflow: hidden; flex-shrink: 0; border: 2px solid #2a2a2a; background: #111; }
        .tb-dd-info { flex: 1; min-width: 0; }
        .tb-dd-username {
            font-family: 'Exo 2', sans-serif; font-weight: 800; font-size: 13px;
            color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            letter-spacing: 0.04em; text-transform: uppercase;
        }
        .tb-dd-badge { line-height: 1; }
        .tb-dd-badge img { width: 18px; height: 18px; object-fit: contain; vertical-align: middle; }
        .tb-dd-coins {
            font-size: 11px; color: #f1c40f; font-weight: 800;
            display: flex; align-items: center; gap: 4px; margin-top: 4px;
            letter-spacing: 0.03em;
        }
        .tb-dd-divider { height: 1px; background: linear-gradient(90deg, #1e1e1e 0%, transparent 100%); margin: 2px 0; }
        .tb-dd-item {
            display: flex; align-items: center; gap: 10px;
            padding: 9px 14px; font-size: 11px; font-weight: 700;
            color: #707880; text-decoration: none;
            transition: background 0.1s, color 0.1s, border-left-color 0.1s;
            cursor: pointer; background: none; border: none; border-left: 2px solid transparent; width: 100%;
            text-align: left; font-family: 'Exo 2', sans-serif;
            letter-spacing: 0.05em; text-transform: uppercase;
        }
        .tb-dd-item i { width: 14px; text-align: center; font-size: 11px; flex-shrink: 0; color: #333; transition: color 0.1s; }
        .tb-dd-item:hover { background: #0d0d0d; color: #ffffff; border-left-color: #333; text-decoration: none; }
        .tb-dd-item:hover i { color: #666; }
        .tb-dd-logout { color: #7a2020; }
        .tb-dd-logout i { color: #4a1515; }
        .tb-dd-logout:hover { background: rgba(192,57,43,0.1); color: var(--tb-accent-bright); border-left-color: var(--tb-accent); }
        .tb-dd-logout:hover i { color: var(--tb-accent); }

        /* Notif badges */
        .sb-notif-badge, #sb-friend-badge {
            position: absolute; top: -3px; right: -3px;
            background: var(--tb-accent); color: #fff;
            font-size: 9px; font-weight: 800; min-width: 14px; height: 14px;
            border-radius: 0;
            display: flex; align-items: center; justify-content: center;
            padding: 0 3px; pointer-events: none; z-index: 10;
        }
        #sbNotifPanel { top: calc(var(--tb-h) + 4px) !important; right: 4px !important; left: auto !important; bottom: auto !important; }
        .sb-notif-item { padding: 9px 12px; border-bottom: 1px solid #111; cursor: pointer; transition: background .1s; display: flex; align-items: flex-start; gap: 8px; }
        .sb-notif-item:hover { background: #0d0d0d; }
        .sb-notif-item.unread { background: rgba(192,57,43,0.05); }
        .sb-notif-item.unread::before { content: ''; width: 4px; height: 4px; border-radius: 0; background: var(--tb-accent); flex-shrink: 0; margin-top: 6px; }
        .sb-notif-item:not(.unread)::before { content: ''; width: 4px; height: 4px; flex-shrink: 0; }
        .sb-notif-icon { font-size: 13px; flex-shrink: 0; margin-top: 2px; }
        .sb-notif-body { flex: 1; min-width: 0; }
        .sb-notif-text { font-size: 12px; color: var(--tb-text); line-height: 1.4; }
        .sb-notif-text strong { color: #ffffff; }
        .sb-notif-time { font-size: 10px; color: #444; margin-top: 2px; }
        .sb-notif-empty { padding: 24px 12px; text-align: center; color: #333; font-size: 12px; }

        /* Icon helpers */
        .icon-coin { display: inline-block; width: 16px; height: 16px; background: url('/images/coin-icon.png') center/contain no-repeat; vertical-align: middle; margin-right: 3px; position: relative; top: -1px; }
        .icon-ampere { display: inline-block; width: 1em; height: 1em; background: url('/images/ampere-plus-icon.png') center/contain no-repeat; vertical-align: middle; margin-right: 3px; }

        /* ── Mobile drawer ── */
        #tb-mobile-overlay {
            display: none; position: fixed; inset: 0;
            background: rgba(0,0,0,0.75);
            z-index: 1050;
        }
        #tb-mobile-drawer {
            position: fixed; top: 0; right: -270px; width: 270px; height: 100%;
            background: #000;
            border-left: 1px solid #1a1a1a;
            box-shadow: -8px 0 40px rgba(0,0,0,0.9);
            z-index: 1060;
            display: flex; flex-direction: column;
            padding: calc(var(--tb-h) + 8px) 0 16px;
            transition: right .22s ease;
            overflow-y: auto;
        }
        #tb-mobile-drawer.open { right: 0; }
        #tb-mobile-overlay.open { display: block; }

        .tmd-header { padding: 12px 14px 10px; }
        .tmd-user { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .tmd-avatar { width: 38px; height: 38px; border-radius: 50%; overflow: hidden; flex-shrink: 0; border: 2px solid #333; background: transparent; }
        .tmd-username { font-family: 'Exo 2', sans-serif; font-weight: 800; font-size: 13px; color: #ffffff; letter-spacing: 0.03em; }
        .tmd-coins { font-size: 11px; color: #f1c40f; font-weight: 700; display: flex; align-items: center; margin-top: 2px; }
        .tmd-login-btn {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 8px 14px; margin-bottom: 8px;
            background: var(--tb-accent); border: none; border-radius: 0;
            color: #ffffff; font-size: 12px; font-weight: 800;
            text-decoration: none; letter-spacing: 0.06em; text-transform: uppercase;
            transition: background 0.15s;
        }
        .tmd-login-btn:hover { background: var(--tb-accent-bright); }
        .tmd-divider { height: 1px; background: #111; margin: 4px 0; }
        .tmd-nav { display: flex; flex-direction: column; }
        .tmd-link {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 16px;
            color: var(--tb-text); font-size: 12px; font-weight: 700;
            text-decoration: none; transition: background .1s, color .1s;
            border-left: 2px solid transparent;
            letter-spacing: 0.05em; text-transform: uppercase;
        }
        .tmd-link i { width: 16px; text-align: center; font-size: 12px; color: #333; flex-shrink: 0; }
        .tmd-link img { flex-shrink: 0; }
        .tmd-link:hover { background: #0a0a0a; color: var(--tb-text-bright); border-left-color: #333; text-decoration: none; }
        .tmd-link:hover i { color: #888; }
        .tmd-link.active { background: rgba(192,57,43,0.08); color: #ff6b6b; border-left-color: var(--tb-accent); }
        .tmd-link.active i { color: var(--tb-accent); }
        .tmd-logout {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 16px; margin-top: 4px;
            color: var(--tb-accent); font-size: 12px; font-weight: 700;
            background: none; border: none; width: 100%; text-align: left;
            cursor: pointer; transition: background .1s;
            font-family: 'Exo 2', sans-serif;
            border-left: 2px solid transparent;
            letter-spacing: 0.05em; text-transform: uppercase;
        }
        .tmd-logout i { width: 16px; text-align: center; font-size: 12px; flex-shrink: 0; }
        .tmd-logout:hover { background: rgba(192,57,43,0.08); color: var(--tb-accent-bright); border-left-color: var(--tb-accent); }

        /* ── Responsive ── */
        @media (max-width: 768px) {
            .tb-nav { display: none !important; }
            .tb-hamburger { display: flex !important; }
            .tb-login-btn { display: none !important; }
        }
        @media (max-width: 480px) {
            .tb-stat { display: none !important; }
        }
    `;
    document.head.appendChild(style);

    if (!window.Avatar2D) { const s = document.createElement('script'); s.src = '/avatar2d.js'; document.head.appendChild(s); }
    if (!window.AmpAvatar) { const s = document.createElement('script'); s.src = '/avatar.js'; document.head.appendChild(s); }

    document.body.insertAdjacentHTML('afterbegin', topbarHTML);

    // Notif panel
    document.body.insertAdjacentHTML('afterbegin', `
        <div id="sbNotifPanel" style="display:none;position:fixed;width:290px;max-height:440px;background:#000;border:1px solid #1a1a1a;border-radius:0;box-shadow:0 8px 32px rgba(0,0,0,.9),0 0 0 1px rgba(255,255,255,.03);z-index:1100;overflow:hidden;flex-direction:column;">
            <div style="padding:8px 14px;border-bottom:1px solid #111;display:flex;align-items:center;justify-content:space-between;background:#000;">
                <span style="font-family:'Exo 2',sans-serif;font-weight:800;font-size:11px;color:#ffffff;letter-spacing:.1em;text-transform:uppercase;">NOTIFICATIONS</span>
                <button onclick="window.markAllNotifsRead()" style="background:none;border:1px solid #222;border-radius:0;color:#444;font-size:10px;font-weight:800;cursor:pointer;text-transform:uppercase;letter-spacing:.06em;padding:2px 8px;transition:color .1s,background .1s,border-color .1s;font-family:'Exo 2',sans-serif;" onmouseover="this.style.color='#fff';this.style.borderColor='#444'" onmouseout="this.style.color='#444';this.style.borderColor='#222'">Mark all read</button>
            </div>
            <div id="sbNotifList" style="overflow-y:auto;flex:1;"></div>
        </div>
    `);

    // ── Mobile drawer toggle ──────────────────────────────────────────────────
    let _drawerOpen = false;
    window.toggleMobileDrawer = function() {
        _drawerOpen ? window.closeMobileDrawer() : window.openMobileDrawer();
    };
    window.openMobileDrawer = function() {
        _drawerOpen = true;
        document.getElementById('tb-mobile-drawer').classList.add('open');
        document.getElementById('tb-mobile-overlay').classList.add('open');
        document.getElementById('tbHamburger').classList.add('open');
        document.body.style.overflow = 'hidden';
    };
    window.closeMobileDrawer = function() {
        _drawerOpen = false;
        document.getElementById('tb-mobile-drawer').classList.remove('open');
        document.getElementById('tb-mobile-overlay').classList.remove('open');
        document.getElementById('tbHamburger').classList.remove('open');
        document.body.style.overflow = '';
    };

    // ── Active page ───────────────────────────────────────────────────────────
    function setActivePage() {
        const path = window.location.pathname;
        const authPages = ['/login.html', '/signup.html'];
        if (authPages.some(p => path === p || path.endsWith(p))) {
            document.body.classList.add('sidebar-auth-page');
            return;
        }
        const pageMap = {
            'home':        p => p === '/' || p === '/index.html',
            'forums':      p => p.includes('/forums') || p.includes('/forum'),
            'groups':      p => p.includes('/group'),
            'trades':      p => p.includes('/trades'),
            'ampereplus':  p => p.includes('/novaplus'),
            'avatar-store':p => p.includes('/avatar-store'),
            'games':       p => p.includes('/games') || p.includes('/game-player'),
            'users':       p => p.includes('/users'),
            'announcements':p=> p.includes('/announcements'),
        };
        document.querySelectorAll('.tb-link').forEach(link => {
            link.classList.remove('active');
            const fn = pageMap[link.dataset.page];
            if (fn && fn(path)) link.classList.add('active');
        });
        document.querySelectorAll('.tmd-link').forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href') || '';
            if (href === '/' && (path === '/' || path === '/index.html')) link.classList.add('active');
            else if (href !== '/' && path.includes(href.replace('.html',''))) link.classList.add('active');
        });
    }

    // ── Avatar ────────────────────────────────────────────────────────────────
    function renderSidebarAvatar(equippedDefs) {
        function tryRender() {
            if (window.Avatar2D) {
                const img  = document.getElementById('sidebarAvatarImg');
                const img2 = document.getElementById('tbDdAvatarImg');
                const img3 = document.getElementById('tmdAvatarImg');
                if (img)  Avatar2D.renderImg(img,  equippedDefs, 32);
                if (img2) Avatar2D.renderImg(img2, equippedDefs, 44);
                if (img3) Avatar2D.renderImg(img3, equippedDefs, 40);
            } else setTimeout(tryRender, 50);
        }
        tryRender();
    }
    function buildEquippedDefs(equippedIds, allItems) {
        const defs = equippedIds.map(id => allItems.find(i => i.id === id)).filter(Boolean);
        const hasSkin = defs.some(d => d.category === 'skin');
        if (!hasSkin) { const ds = allItems.find(i => i.category === 'skin' && i.is_default); if (ds) defs.push(ds); }
        return defs;
    }

    // ── Load user data ────────────────────────────────────────────────────────
    async function loadUserData() {
        try {
            const res = await fetch('/api/get-balance');
            if (!res.ok) return;
            const data = await res.json();
            if (data.error) return;
            _isLoggedIn = true;

            if (data.locked && !window.location.pathname.includes('locked-account')) {
                window.location.href = '/locked-account.html'; return;
            }
            if (!data.username) return;

            currentUsername = data.username;
            window.currentUsername = currentUsername;
            _isOwner = !!data.is_owner;

            const coins = (data.coins || 0).toLocaleString();
            const setEl = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
            setEl('tb-coins-val', coins);
            setEl('tbDdCoins', coins);
            setEl('tbDdUsername', data.username);
            setEl('tmdCoins', coins);
            setEl('tmdUsername', data.username);

            const ddProfile = document.getElementById('tbDdProfile');
            if (ddProfile) ddProfile.href = `/profile.html?user=${encodeURIComponent(data.username)}`;

            // Show badge in dropdown header
            window.ampNameBadge(data.username).then(badgeHtml => {
                const badgeEl = document.getElementById('tbDdBadge');
                if (badgeEl && badgeHtml) badgeEl.innerHTML = badgeHtml;
            });

            if (_isOwner) {
                document.querySelectorAll('.tb-owner-only, .tmd-owner-only').forEach(el => el.style.display = '');
            }

            // Show user section in drawer
            const tmdUser = document.getElementById('tmdUser');
            if (tmdUser) tmdUser.style.display = 'flex';
            document.querySelectorAll('.tmd-guest-only').forEach(el => el.style.display = 'none');

            const [profileRes, itemsRes] = await Promise.all([
                fetch(`/api/get-profile?username=${encodeURIComponent(data.username)}`),
                fetch('/api/avatar/get-items')
            ]);
            const profileData = await profileRes.json();
            const itemsData   = await itemsRes.json();
            isAmpere = profileData.user?.ampere_plus?.active || false;
            window.isAmpere = isAmpere;
            const avatarEl = document.getElementById('universalProfileIcon');
            if (avatarEl && isAmpere) avatarEl.classList.add('ampere-plus');
            _allItems    = itemsData.items || [];
            _equippedIds = profileData.user?.customization?.equippedAvatarItems || [];
            renderSidebarAvatar(buildEquippedDefs(_equippedIds, _allItems));

        } catch (err) { console.error('Topbar error:', err); }
    }

    window.refreshSidebarAvatar = function(equippedIds) {
        _equippedIds = equippedIds || _equippedIds;
        renderSidebarAvatar(buildEquippedDefs(_equippedIds, _allItems));
    };
    window.goToMyProfile = function() {
        if (currentUsername) window.location.href = `/profile.html?user=${encodeURIComponent(currentUsername)}`;
        else window.location.href = '/login.html';
    };

    // ── Profile dropdown ──────────────────────────────────────────────────────
    let _ddOpen = false;
    window.toggleProfileDropdown = function() {
        if (!_isLoggedIn) { window.location.href = '/login.html'; return; }
        const dd = document.getElementById('tb-profile-dropdown');
        if (!dd) return;
        _ddOpen = !_ddOpen;
        dd.style.display = _ddOpen ? 'flex' : 'none';
        if (_ddOpen) setTimeout(() => document.addEventListener('click', _closeDdOnOutside, { once: true }), 0);
    };
    function _closeDdOnOutside(e) {
        const dd  = document.getElementById('tb-profile-dropdown');
        const btn = document.getElementById('universalProfileIcon');
        if (dd && !dd.contains(e.target) && btn && !btn.contains(e.target)) {
            _ddOpen = false; dd.style.display = 'none';
        } else if (_ddOpen) {
            setTimeout(() => document.addEventListener('click', _closeDdOnOutside, { once: true }), 0);
        }
    }

    // ── Friend badge ──────────────────────────────────────────────────────────
    function setFriendBadge(count) {
        const btn = document.getElementById('universalProfileIcon');
        if (!btn) return;
        let badge = document.getElementById('sb-friend-badge');
        if (count > 0) {
            if (!badge) { badge = document.createElement('span'); badge.id = 'sb-friend-badge'; badge.className = 'sb-notif-badge'; badge.style.cssText='position:absolute;top:-3px;right:-3px;'; btn.style.position='relative'; btn.appendChild(badge); }
            badge.textContent = count > 9 ? '9+' : count;
        } else if (badge) badge.remove();
    }
    async function pollFriendRequests() {
        try {
            const r = await fetch('/api/get-friends');
            if (!r.ok) return;
            const d = await r.json();
            if (!d.success) return;
            const count = (d.pending || []).length;
            setFriendBadge(count);
            if (_lastPendingCount >= 0 && count > _lastPendingCount && typeof window.Swal !== 'undefined') {
                const diff = count - _lastPendingCount;
                window.Swal.fire({ toast:true, position:'top-end', icon:'info',
                    title: diff === 1 ? '👋 New friend request!' : `👋 ${diff} new friend requests!`,
                    background:'#0d0d0d', color:'#a0a8b0', showConfirmButton:false, timer:5000, timerProgressBar:true });
            }
            _lastPendingCount = count;
        } catch(e) {}
    }

    // ── Notifications ─────────────────────────────────────────────────────────
    let _notifData = [], _notifPanelOpen = false;
    function _timeAgo(ts) {
        const s = Math.floor((Date.now()-ts)/1000);
        if(s<60) return 'just now'; if(s<3600) return Math.floor(s/60)+'m ago';
        if(s<86400) return Math.floor(s/3600)+'h ago'; return Math.floor(s/86400)+'d ago';
    }
    function _notifIcon(type){return{friend_request:'👋',friend_accepted:'🤝',trade_received:'📦',trade_accepted:'✅',trade_declined:'❌',warning:'⚠️'}[type]||'🔔';}
    function _notifText(n){const u=`<strong>${n.data?.fromUsername||'Someone'}</strong>`;switch(n.type){case 'friend_request':return`${u} sent you a friend request`;case 'friend_accepted':return`${u} accepted your friend request`;case 'trade_received':return`${u} sent you a trade offer`;case 'trade_accepted':return`${u} accepted your trade`;case 'trade_declined':return`${u} declined your trade`;case 'dm_received':return`${u} sent you a message`;case 'warning':{const num=n.data?.warningNumber||'?';const locked=n.data?.autoLocked;const reason=n.data?.reason||'No reason given';return`<span style="color:#e74c3c;">⚠️ Warning ${num}/3 issued</span>: ${reason}${locked?' — <strong style="color:#ee8080;">Account locked</strong>':''}`;}default:return'New notification';}}
    function _notifLink(n){switch(n.type){case 'friend_request':case 'friend_accepted':return'/friends.html';case 'trade_received':case 'trade_accepted':case 'trade_declined':return'/trades.html';case 'warning':return'/account.html';case 'dm_received':return'/dms.html';default:return null;}}
    let _notifOffset = 0, _notifHasMore = false;
    const _notifAvatarCache = {}; // username -> dataURL

    function _waitForAvatar2D() {
        return new Promise(resolve => {
            if (window.Avatar2D) { resolve(); return; }
            const t = setInterval(() => { if (window.Avatar2D) { clearInterval(t); resolve(); } }, 80);
            setTimeout(() => { clearInterval(t); resolve(); }, 4000);
        });
    }

    async function _renderNotifAvatar(username) {
        if (_notifAvatarCache[username] !== undefined) return _notifAvatarCache[username];
        try {
            await _waitForAvatar2D();
            if (!window.Avatar2D) { _notifAvatarCache[username] = null; return null; }
            const pd = await fetch(`/api/get-profile?username=${encodeURIComponent(username)}`).then(r => r.json());
            if (!pd.success) { _notifAvatarCache[username] = null; return null; }
            const cust    = pd.user?.customization || {};
            const itemIds = cust.equippedAvatarItems || [];
            const items   = _allItems.length ? _allItems : ((await fetch('/api/avatar/get-items').then(r => r.json()).catch(() => ({ items: [] }))).items || []);
            const defs    = itemIds.map(id => items.find(i => i.id === id)).filter(Boolean);
            const url     = window.Avatar2D.renderToDataURL(defs, 36);
            _notifAvatarCache[username] = url;
            return url;
        } catch { _notifAvatarCache[username] = null; return null; }
    }

    function renderNotifPanel() {
        const list = document.getElementById('sbNotifList');
        if (!list) return;
        if (!_notifData.length) { list.innerHTML = '<div class="sb-notif-empty">No notifications yet</div>'; return; }
        const items = _notifData.map(n => {
            const fromUser = n.data?.fromUsername;
            const avatarHtml = fromUser
                ? `<img class="sb-notif-avatar" data-user="${fromUser}" src="" width="36" height="36" style="width:36px;height:36px;border-radius:50%;flex-shrink:0;background:rgba(20,20,20,.8);border:1px solid rgba(80,80,80,.3);object-fit:cover;">`
                : `<span style="font-size:1.3rem;flex-shrink:0;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">🔔</span>`;
            return `
            <div class="sb-notif-item ${n.read?'':'unread'}" onclick="window._clickNotif('${n.id}','${_notifLink(n)||''}')">
                ${avatarHtml}
                <div class="sb-notif-body">
                    <div class="sb-notif-text">${_notifText(n)}</div>
                    <div class="sb-notif-time">${_timeAgo(n.created_at)}</div>
                </div>
            </div>`;
        }).join('');
        const loadMoreBtn = _notifHasMore
            ? `<div style="padding:.6rem 1rem;text-align:center;"><button onclick="window._loadMoreNotifs()" style="background:rgba(192,57,43,.15);border:1px solid rgba(192,57,43,.35);color:#e74c3c;font-family:'Exo 2',sans-serif;font-size:.75rem;font-weight:700;padding:.4rem 1.2rem;border-radius:0;cursor:pointer;letter-spacing:.06em;text-transform:uppercase;">Load More</button></div>`
            : '';
        list.innerHTML = items + loadMoreBtn;

        // Populate avatars async
        list.querySelectorAll('img.sb-notif-avatar').forEach(async img => {
            const username = img.dataset.user;
            if (!username) return;
            const url = await _renderNotifAvatar(username);
            if (url) img.src = url;
            else img.style.background = 'rgba(30,30,30,.8)';
        });
    }

    window._loadMoreNotifs = async function() {
        _notifOffset += 10;
        try {
            const r = await fetch(`/api/notifications/list?offset=${_notifOffset}`);
            if (!r.ok) return;
            const d = await r.json();
            if (!d.success) return;
            _notifData = _notifData.concat(d.notifications || []);
            _notifHasMore = !!d.hasMore;
            renderNotifPanel();
        } catch {}
    };
    function setNotifBadge(count) {
        const btn = document.getElementById('sbBellBtn');
        if (!btn) return;
        let badge = document.getElementById('sb-notif-badge');
        if (count > 0) {
            if (!badge) { badge = document.createElement('span'); badge.id='sb-notif-badge'; badge.className='sb-notif-badge'; btn.appendChild(badge); }
            badge.textContent = count > 9 ? '9+' : count;
        } else if (badge) badge.remove();
    }
    // Track warnings shown this page load (prevents double-show on rapid polls)
    const _shownWarnings = new Set();

    function _showWarningOverlay(notif) {
        if (_shownWarnings.has(notif.id)) return;
        _shownWarnings.add(notif.id);
        // Mark as read in DB immediately so it won't reappear on any device
        fetch('/api/notifications/mark-read', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ ids: [notif.id] })
        }).catch(() => {});

        const num      = notif.data?.warningNumber || '?';
        const reason   = notif.data?.reason || 'No reason given';
        const locked   = notif.data?.autoLocked;
        const pct      = Math.round((num / 3) * 100);
        const barColor = num >= 3 ? '#c0392b' : num === 2 ? '#e74c3c' : '#ff6b6b';

        // Build overlay
        const overlay = document.createElement('div');
        overlay.id = '_warnOverlay';
        overlay.style.cssText = [
            'position:fixed;inset:0;z-index:99999',
            'background:rgba(0,0,0,0.97)',
            'display:flex;align-items:center;justify-content:center',
            'font-family:"Exo 2",sans-serif',
            'animation:_warnFadeIn .25s ease',
        ].join(';');

        overlay.innerHTML = `
            <style>
                @keyframes _warnFadeIn { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:scale(1)} }
                @keyframes _warnPulse  { 0%,100%{opacity:1} 50%{opacity:.6} }
                #_warnOverlay .warn-icon { animation: _warnPulse 1.4s ease infinite; }
            </style>
            <div style="max-width:480px;width:90%;background:linear-gradient(160deg,#111,#0a0a0a);border:1px solid rgba(192,57,43,.4);border-radius:0;padding:2.5rem 2rem;text-align:center;box-shadow:0 0 60px rgba(192,57,43,.2),0 8px 40px rgba(0,0,0,.9);">
                <div class="warn-icon" style="font-size:3.5rem;margin-bottom:1rem;">⚠️</div>
                <div style="font-size:1.65rem;font-weight:900;color:#e74c3c;letter-spacing:.08em;text-transform:uppercase;margin-bottom:.4rem;">
                    Account Warning
                </div>
                <div style="font-size:.85rem;font-weight:700;color:#666;letter-spacing:.12em;text-transform:uppercase;margin-bottom:1.5rem;">
                    Warning ${num} of 3
                </div>

                <!-- Progress bar -->
                <div style="background:rgba(255,255,255,.07);border-radius:99px;height:8px;margin-bottom:1.5rem;overflow:hidden;">
                    <div style="height:100%;width:${pct}%;background:${barColor};border-radius:99px;transition:width .6s ease;box-shadow:0 0 10px ${barColor};"></div>
                </div>

                <div style="background:rgba(255,140,0,.08);border:1px solid rgba(255,140,0,.2);border-radius:12px;padding:.9rem 1rem;margin-bottom:1.5rem;text-align:left;">
                    <div style="font-size:.7rem;font-weight:800;color:#e74c3c;letter-spacing:.1em;text-transform:uppercase;margin-bottom:.3rem;">Reason</div>
                    <div style="color:#c8d4e0;font-size:.93rem;line-height:1.5;">${reason.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
                </div>

                ${locked ? `
                <div style="background:rgba(180,0,0,.18);border:1px solid rgba(220,60,60,.35);border-radius:12px;padding:.75rem 1rem;margin-bottom:1.5rem;color:#ee8080;font-size:.88rem;font-weight:700;">
                    🔒 Your account has been <strong>automatically locked</strong> after 3 warnings.
                </div>` : `
                <div style="color:#666;font-size:.82rem;margin-bottom:1.5rem;line-height:1.6;">
                    ${num < 3 ? `You have <strong style="color:#e74c3c;">${3 - num} warning${3 - num === 1 ? '' : 's'}</strong> remaining before your account is locked.` : ''}
                    Please review the community guidelines.
                </div>`}

                <button onclick="document.getElementById('_warnOverlay').remove()" style="background:rgba(192,57,43,.15);border:1px solid rgba(192,57,43,.4);border-radius:0;color:#e74c3c;font-family:'Exo 2',sans-serif;font-size:.9rem;font-weight:800;letter-spacing:.06em;padding:.7rem 2.5rem;cursor:pointer;text-transform:uppercase;transition:all .15s;">
                    I Understand
                </button>
            </div>`;

        document.body.appendChild(overlay);
    }

    async function fetchNotifications() {
        if (!_isLoggedIn) return;
        try {
            const r = await fetch('/api/notifications/list?offset=0');
            if (!r.ok) return;
            const d = await r.json();
            if (!d.success) return;
            _notifOffset  = 0;
            _notifData    = d.notifications || [];
            _notifHasMore = !!d.hasMore;
            setNotifBadge(d.unreadCount || 0);
            if (_notifPanelOpen) renderNotifPanel();

            // Show full-screen overlay for any unread warning notifications not yet seen
            _notifData
                .filter(n => n.type === 'warning' && !n.read && !_shownWarnings.has(n.id))
                .forEach(n => _showWarningOverlay(n));
        } catch(e) {}
    }
    window.toggleNotifPanel = function() {
        const panel = document.getElementById('sbNotifPanel');
        if (!panel) return;
        _notifPanelOpen = !_notifPanelOpen;
        panel.style.display = _notifPanelOpen ? 'flex' : 'none';
        if (_notifPanelOpen) { renderNotifPanel(); setTimeout(() => document.addEventListener('click', _closeNotifOnOutside, { once: true }), 0); }
    };
    function _closeNotifOnOutside(e) {
        const panel = document.getElementById('sbNotifPanel');
        const btn   = document.getElementById('sbBellBtn');
        if (panel && !panel.contains(e.target) && btn && !btn.contains(e.target)) {
            _notifPanelOpen = false; panel.style.display = 'none';
        } else if (_notifPanelOpen) {
            setTimeout(() => document.addEventListener('click', _closeNotifOnOutside, { once: true }), 0);
        }
    }
    window.markAllNotifsRead = async function() {
        try {
            await fetch('/api/notifications/mark-read', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({all:true}) });
            _notifData.forEach(n => n.read = 1);
            setNotifBadge(0); renderNotifPanel();
        } catch(e) {}
    };
    window._clickNotif = async function(id, link) {
        try {
            await fetch('/api/notifications/mark-read', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ids:[id]}) });
            const n = _notifData.find(n => n.id === id);
            if (n) n.read = 1;
            setNotifBadge(_notifData.filter(n => !n.read).length);
            renderNotifPanel();
        } catch(e) {}
        if (link) window.location.href = link;
    };

    // ── Logout ────────────────────────────────────────────────────────────────
    window.topbarLogout = async function() {
        try { await fetch('/api/logout', { method:'POST' }); } catch {}
        window.location.href = '/login.html';
    };

    // ── Status heartbeat ──────────────────────────────────────────────────────
    (function() {
        const HEARTBEAT_MS = 60 * 1000;
        const GAME_PAGES   = ['/game-player', '/games/'];
        function currentStatus() { return GAME_PAGES.some(p => location.pathname.startsWith(p)) ? 'playing' : 'online'; }
        async function setStatus(s) { try { await fetch('/api/set-status', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:s}) }); } catch(_) {} }
        setStatus(currentStatus());
        const _t = setInterval(() => setStatus(currentStatus()), HEARTBEAT_MS);
        function goOffline() { clearInterval(_t); const p = JSON.stringify({status:'offline'}); navigator.sendBeacon ? navigator.sendBeacon('/api/set-status', new Blob([p],{type:'application/json'})) : setStatus('offline'); }
        window.addEventListener('beforeunload', goOffline);
        document.addEventListener('visibilitychange', () => { if (document.hidden) clearInterval(_t); else setStatus(currentStatus()); });
    })();

    // ── Boot ──────────────────────────────────────────────────────────────────
    setActivePage();
    loadUserData().then(() => {
        if (!_isLoggedIn) {
            document.querySelectorAll('.tb-auth-only, .tmd-auth-only').forEach(el => el.style.display = 'none');
            document.querySelectorAll('.tb-guest-only').forEach(el => el.style.display = '');
            const av = document.getElementById('universalProfileIcon');
            if (av) av.style.display = 'none';
        } else {
            document.querySelectorAll('.tb-guest-only, .tmd-guest-only').forEach(el => el.style.display = 'none');
            setTimeout(() => {
                pollFriendRequests(); fetchNotifications();
                setInterval(pollFriendRequests, 60000);
                setInterval(fetchNotifications, 30000);
            }, 2000);
        }
    });
})();
