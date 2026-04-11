// =============================================================
//  Service Worker — Notificaciones Push para Meseros
//  Archivo: static/sw.js
// =============================================================

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// ── Recibir push del servidor ─────────────────────────────────
self.addEventListener('push', function (event) {
    let data = { title: '🍽️ Pedido listo', body: 'Un pedido está listo para servir.' };

    try {
        if (event.data) data = event.data.json();
    } catch (e) {
        if (event.data) data.body = event.data.text();
    }

    const opciones = {
        body:    data.body  || 'Un pedido está listo.',
        icon:    '/static/img/icon-192.png',   // Cambia por tu ícono si tienes uno
        badge:   '/static/img/badge-72.png',   // Opcional: ícono pequeño en Android
        vibrate: [300, 150, 300, 150, 500],
        tag:     'pedido-listo',               // Agrupa notificaciones del mismo tipo
        renotify: true,                        // Vuelve a notificar aunque ya haya una
        data:    { mesa: data.mesa || '' },
        actions: [
            { action: 'ver', title: '👀 Ver pedidos' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, opciones)
    );
});

// ── Al tocar la notificación → abrir/enfocar el dashboard ────
self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    const accion = event.action;
    const url    = '/dashboard';   // Ajusta si tu ruta es distinta

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function (clientes) {
                // Si ya hay una ventana abierta, enfocarla
                for (const cliente of clientes) {
                    if (cliente.url.includes('/dashboard') && 'focus' in cliente) {
                        return cliente.focus();
                    }
                }
                // Si no, abrir una nueva
                if (self.clients.openWindow) {
                    return self.clients.openWindow(url);
                }
            })
    );
});
