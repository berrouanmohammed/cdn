var supportTimer;
var supportTime;
var supportCode;
// Show/hide floating indicator based on cart visibility
jQuery(document).ready(function () {
    // Main menu
    jQuery('ul').on('click', '.collapsed', function (event) {
        // Prevent the collapse/expand if the click is on an <a> inside a .sub-menu
        if (jQuery(event.target).closest('.sub-menu a').length) {
            return; // Exit early if the click is on an <a> inside a .sub-menu
        }
        // Find the submenu within the clicked .collapsed item
        const currentSubMenu = jQuery(this).find('.sub-menu');
        // Collapse all other submenus
        jQuery('.collapsed .sub-menu').not(currentSubMenu).removeClass('is-collapsed');
        jQuery('.collapsed').not(jQuery(this)).removeClass('when-collapsed');
        // Toggle the current submenu
        if (currentSubMenu.hasClass('is-collapsed')) {
            currentSubMenu.removeClass('is-collapsed');
            jQuery(this).removeClass('when-collapsed');
        } else {
            currentSubMenu.addClass('is-collapsed');
            jQuery(this).addClass('when-collapsed');
        }
    });
    // Left side toggle
    const toggleButton = jQuery('.open-menu-mobile');
    const closeButton = jQuery('.close-mobile-menu');
    const leftPanel = jQuery('.leftpanel');
    function toggleMenu() {
        leftPanel.toggleClass('open-mobile');
        // Save the state to local storage
        localStorage.setItem('menuOpen', leftPanel.hasClass('open-mobile'));
    }
    function closeMenu() {
        leftPanel.removeClass('open-mobile');
        // Save the state to local storage
        localStorage.setItem('menuOpen', false);
    }
    function loadMenuState() {
        const menuOpen = localStorage.getItem('menuOpen');
        if (menuOpen === 'true') {
            leftPanel.addClass('open-mobile');
        } else {
            leftPanel.removeClass('open-mobile');
        }
    }
    if (toggleButton.length && leftPanel.length) {
        toggleButton.on('click', toggleMenu);
    }
    if (closeButton.length && leftPanel.length) {
        closeButton.on('click', closeMenu);
    }
    const viewportWidth = jQuery(window).width();
    if (viewportWidth > 768) {
        loadMenuState();
    }
    // Custom dropdowns
    // Ferme tous les menus ouverts
    function closeAllMenus() {
        jQuery('.dropdown-custom-menu.show').removeClass('show');
    }
    // Add click listener to each button
    jQuery('.border-btn').each(function () {
        jQuery(this).on('click', function (event) {
            // Prevent immediate closure of the menu
            event.stopPropagation();
            // Close all other menus
            const dropdownMenu = jQuery(this).next();
            if (dropdownMenu.hasClass('show')) {
                dropdownMenu.removeClass('show');
            } else {
                closeAllMenus();
                dropdownMenu.addClass('show');
            }
        });
    });
    // Close dropdown menus if the user clicks outside
    jQuery(document).on('click', function () {
        closeAllMenus();
    });
    // Support Modal
    var modal = jQuery("#supportmodal");
    var btn = jQuery(".request-modal");
    var span = jQuery(".close");
    const requestBtn = jQuery('.request-btn');
    const codeSupport = jQuery('.code-support');
    // Open the modal when the user clicks the button
    btn.on('click', function () {
        modal.css("display", "flex");
        if (supportCode) {
            return;
        }
        jQuery.ajax({
            dataType: "json",
            url: "/genious-voip.php?op=getcode",
            success: function (data) {
                if (data.status == 'success') {
                    requestBtn.addClass('not-show');
                    codeSupport.addClass('show');
                    supportCode = data.data.code;
                    codeHtml = '';
                    data.data.code.toString().split('').forEach(function (digit) {
                        codeHtml += `<span>${digit}</span>`;
                    });
                    jQuery('#supportmodal .code-support .code-inline').html(codeHtml).show();
                    supportTimer = setInterval(function () {
                        timeBetweenDates(data.data.now, new Date(data.data.expiration_timestamp * 1000));
                    }, 1000);
                } else {
                    requestBtn.prop('disabled', false);
                    clearInterval(supportTimer);
                    supportTime = null;
                    jQuery('#supportmodal .code-support .code-inline').html('');
                    requestBtn.removeClass('not-show');
                    codeSupport.removeClass('show');
                }
            }
        });
    });
    // Close the modal when the user clicks the close button (x)
    span.on('click', function () {
        modal.css("display", "none");
    });
    // Close the modal when the user clicks outside the modal content
    jQuery(window).on('click', function (event) {
        if (jQuery(event.target).is(modal)) {
            modal.css("display", "none");
        }
    });
    // Support Code Generation
    requestBtn.click(function () {
        event.preventDefault();
        requestBtn.prop('disabled', true);
        jQuery.ajax({
            dataType: "json",
            url: "/genious-voip.php?op=generate",
            success: function (data) {
                if (data.status == 'success') {
                    requestBtn.addClass('not-show');
                    codeSupport.addClass('show');
                    supportCode = data.data.code;
                    codeHtml = '';
                    data.data.code.toString().split('').forEach(function (digit) {
                        codeHtml += `<span>${digit}</span>`;
                    });
                    jQuery('#supportmodal .code-support .code-inline').html(codeHtml).show();
                    supportTimer = setInterval(function () {
                        timeBetweenDates(data.data.now, new Date(data.data.expiration_timestamp * 1000));
                    }, 1000);
                } else {
                    clearInterval(supportTimer);
                    supportTime = null;
                    location.reload();
                }
                requestBtn.prop('disabled', false);
            }
        });
    });
});
function timeBetweenDates(fromDate, toDate) {
    if (!supportTime) {
        supportTime = fromDate;
    }
    var dateEntered = toDate;
    var now = new Date(supportTime * 1000);
    var difference = dateEntered.getTime() - now.getTime();
    if (difference <= 0) {
        // Timer done
        clearInterval(supportTimer);
        jQuery('.request-btn').removeClass('not-show').prop('disabled', false);
        jQuery('.code-support').removeClass('show');
        jQuery("#supportmodal .timing-code").hide();
        supportCode = null;
        supportTime = null;
    } else if (difference > 86400000) {
        clearInterval(supportTimer);
    } else {
        var seconds = Math.floor(difference / 1000);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        hours %= 24;
        minutes %= 60;
        seconds %= 60;
        jQuery("#supportmodal .timing-code #hours").text(hours + 'h');
        jQuery("#supportmodal .timing-code #minutes").text(minutes + 'm');
        jQuery("#supportmodal .timing-code #seconds").text(seconds + 's');
        jQuery("#supportmodal .timing-code").css("display", "flex");
        supportTime++;
    }
}
