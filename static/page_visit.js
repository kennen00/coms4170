$(document).ready(function () {
    if (window.location.pathname.startsWith('/learn')) {
        $.ajax({
            url: '/learn/visit',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ path: window.location.pathname }),
        });
    }
});
