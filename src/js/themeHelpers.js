import NProgress from "nprogress";
import "gentelella-helper"; // smartresize
import "bootstrap";

// modernized version of gentelella helpers from https://colorlib.com/polygon/build/js/custom.js
// there are helpers for:
// 1. Panel toolbox
// 2. Tooltip
// 3. Progressbar
// 4. Switchery
// 5. iCheck
// 6. Table
// 7. 

export function setupPanelToolbox($container) {
    // Panel toolbox
    $container.find('.collapse-link').on('click', function () {
        var $BOX_PANEL = $(this).closest('.x_panel'),
            $ICON = $(this).find('i'),
            $BOX_CONTENT = $BOX_PANEL.find('.x_content');

        // fix for some div with hardcoded fix class
        if ($BOX_PANEL.attr('style')) {
            $BOX_CONTENT.slideToggle(200, function () {
                $BOX_PANEL.removeAttr('style');
            });
        } else {
            $BOX_CONTENT.slideToggle(200);
            $BOX_PANEL.css('height', 'auto');
        }

        $ICON.toggleClass('fa-chevron-up fa-chevron-down');
    });

    $container.find('.close-link').click(function () {
        var $BOX_PANEL = $(this).closest('.x_panel');

        $BOX_PANEL.remove();
    });
    // /Panel toolbox
}

export function setupTooltips($container) {
    // Tooltip
    $container.find('[data-toggle="tooltip"]').tooltip({
        container: 'body'
    });
    // /Tooltip
}

export function setupProgressbar($container) {
    // Progressbar
    $container.find('.progress .progress-bar').progressbar();
    // /Progressbar
}

export function setupSwitchery($container) {
    // Switchery
    $container.find('.js-switch').each((i, el) => {
        var switchery = new Switchery(el, {
            color: '#26B99A'
        });
    });
    // /Switchery
}

export function setupiCheck($container) {
    // iCheck
    $container.find('input.flat').iCheck({
        checkboxClass: 'icheckbox_flat-green',
        radioClass: 'iradio_flat-green'
    });
    // /iCheck
}

export function setupTable($container) {
    // Table
    var checkState = '';
    var $bulkActionInputs = $container.find('.bulk_action input');

    function countChecked() {
        if (checkState === 'all') {
            $bulkActionInputs.filter("[name='table_records']").iCheck('check');
        }
        if (checkState === 'none') {
            $bulkActionInputs.filter("name='table_records']").iCheck('uncheck');
        }

        var checkCount = $bulkActionInputs.filter("[name='table_records']:checked").length;

        if (checkCount) {
            $container.find('.column-title').hide();
            $container.find('.bulk-actions').show();
            $container.find('.action-cnt').html(checkCount + ' Records Selected');
        } else {
            $container.find('.column-title').show();
            $container.find('.bulk-actions').hide();
        }
    }

    $container.find('table input').on({
        ifChecked: function () {
            checkState = '';
            $(this).parent().parent().parent().addClass('selected');
            countChecked();
        },
        ifUnchecked: () => {
            checkState = '';
            $(this).parent().parent().parent().removeClass('selected');
            countChecked();
        }
    });

    $bulkActionInputs.on({
        ifChecked: function () {
            checkState = '';
            $(this).parent().parent().parent().addClass('selected');
            countChecked();
        },
        ifUnchecked: function () {
            checkState = '';
            $(this).parent().parent().parent().removeClass('selected');
            countChecked();
        }
    });

    $bulkActionInputs.filter('#check-all').on({
        ifChecked: function () {
            checkState = 'all';
            countChecked();
        },
        ifUnchecked: function () {
            checkState = 'none';
            countChecked();
        }
    });
    // /Table
}

export function setupAccordion($container) {
    // Accordion
    $container.find(".expand").on("click", function () {
        $(this).next().slideToggle(200);
        $expand = $(this).find(">:first-child");

        if ($expand.text() == "+") {
            $expand.text("-");
        } else {
            $expand.text("+");
        }
    });
    // /Accordion
}







