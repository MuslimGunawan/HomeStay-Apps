const routesMap: Record<string, string> = {
    'home': '/',
    'admin.active-stays': '/admin/active-stays',
    'admin.amenities': '/admin/amenities',
    'admin.amenities.store': '/admin/amenities/store',
    'admin.amenities.delete': '/admin/amenities/{id}/delete',
    'admin.amenities.update': '/admin/amenities/{id}/update',
    'admin.complaints': '/admin/complaints',
    'admin.complaints.resolve': '/admin/complaints/{id}/resolve',
    'admin.dashboard': '/admin/dashboard',
    'admin.homestays': '/admin/homestays',
    'admin.homestays.create': '/admin/homestays/create',
    'admin.homestays.store': '/admin/homestays/store',
    'admin.homestays.delete': '/admin/homestays/{id}/delete',
    'admin.homestays.edit': '/admin/homestays/{id}/edit',
    'admin.homestays.update': '/admin/homestays/{id}/update',
    'admin.payments': '/admin/payments',
    'admin.payments.store': '/admin/payments/store',
    'admin.payments.delete': '/admin/payments/{id}/delete',
    'admin.payments.toggle': '/admin/payments/{id}/toggle',
    'admin.payments.update': '/admin/payments/{id}/update',
    'admin.reservations': '/admin/reservations',
    'admin.reservations.approve': '/admin/reservations/{id}/approve',
    'admin.reservations.reject': '/admin/reservations/{id}/reject',
    'admin.settings.branding': '/admin/settings/branding',
    'admin.settings.branding.update': '/admin/settings/branding/update',
    'admin.support': '/admin/support',
    'admin.support.resolve': '/admin/support/{id}/resolve',
    'admin.users': '/admin/users',
    'admin.users.store': '/admin/users/store',
    'admin.users.delete': '/admin/users/{id}/delete',
    'admin.users.toggle-permission': '/admin/users/{id}/toggle-permission',
    'admin.users.update': '/admin/users/{id}/update',
    'bookings.receipt': '/bookings/{id}/receipt',
    'bookings.success': '/bookings/{id}/success',
    'bookings.store': '/checkout/store',
    'dashboard': '/dashboard',
    'explore': '/explore',
    'guest.complaint.submit': '/guest/bookings/{bookingId}/complaint',
    'guest.review.submit': '/guest/bookings/{bookingId}/review',
    'guest.dashboard': '/guest/dashboard',
    'guest.wishlist': '/guest/wishlist',
    'guest.wishlist.toggle': '/guest/wishlist/toggle/{homestayId}',
    'support.help': '/help',
    'support.submit': '/help/submit',
    'homestays.show': '/homestays/{slug}',
    'bookings.checkout': '/homestays/{slug}/checkout',
    'host.active-stays': '/host/active-stays',
    'host.complaints': '/host/complaints',
    'host.complaints.resolve': '/host/complaints/{id}/resolve',
    'host.dashboard': '/host/dashboard',
    'host.homestays': '/host/homestays',
    'host.homestays.create': '/host/homestays/create',
    'host.homestays.store': '/host/homestays/store',
    'host.homestays.delete': '/host/homestays/{id}/delete',
    'host.homestays.edit': '/host/homestays/{id}/edit',
    'host.homestays.update': '/host/homestays/{id}/update',
    'host.reservations': '/host/reservations',
    'host.reservations.approve': '/host/reservations/{id}/approve',
    'host.reservations.reject': '/host/reservations/{id}/reject',
    'user-password.update': '/settings/password',
    'profile.edit': '/settings/profile',
    'profile.update': '/settings/profile',
    'profile.destroy': '/settings/profile',
    'security.edit': '/settings/security'
};

export function route(name: string, params?: Record<string, any> | any): string {
    const pattern = routesMap[name];

    if (!pattern) {
        console.warn(`Route "${name}" not found in routesMap.`);

        return name;
    }
    
    if (!params) {
        return pattern;
    }
    
    let url = pattern;
    
    // If params is a primitive (like a number or string), and there is exactly one placeholder, replace it.
    if (typeof params !== 'object') {
        const placeholders = pattern.match(/\{[^}]+\}/g);

        if (placeholders && placeholders.length === 1) {
            return url.replace(placeholders[0], String(params));
        }

        return url;
    }
    
    // Replace placeholders and collect used keys
    const usedKeys = new Set<string>();
    
    Object.entries(params).forEach(([key, value]) => {
        const placeholder = `{${key}}`;

        if (url.includes(placeholder)) {
            url = url.replace(placeholder, String(value));
            usedKeys.add(key);
        }
    });
    
    // For other keys, append as query parameters
    const queryParamsList: string[] = [];
    Object.entries(params).forEach(([key, value]) => {
        if (!usedKeys.has(key) && value !== undefined && value !== null && value !== '') {
            queryParamsList.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
        }
    });
    
    if (queryParamsList.length > 0) {
        url += '?' + queryParamsList.join('&');
    }
    
    return url;
}
