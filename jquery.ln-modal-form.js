;
(function ($) {
    'use strict';

    var ModalForm = function (element, options) {
        this.$element = $(element);
        this.$modal = $(this.$element.data('target'));
        this.isShown = false;
        this.options = options;

        var that = this;

        this.$element.click(function (event) {
            event.preventDefault();

            that.show();
        });
    };

    ModalForm.DEFAULTS = {
        type: 'add'
    };

    ModalForm.prototype.show = function () {
        var that = this;

        if (this.isShown) {
            return;
        }

        this.isShown = true;
        this.$element.attr('disabled', true);

        $.ajax({
            url: that.$element.attr('href'),
            type: 'get'
        }).done(function (data) {
            that.load(data);
        }).fail(function () {
            that.isShown = false;
        });
    };

    ModalForm.prototype.load = function (data) {
        var that = this;

        this.$modal.html(data);

        this.form();

        this.$modal.modal();

        this.$modal.on('hidden.bs.modal', function () {
            that.$modal.html('');
            that.isShown = false;
            that.$element.attr('disabled', false);
        });

        this.$element.trigger('loaded.modal-form');
    };

    ModalForm.prototype.form = function () {
        var that = this;
        var $form = this.$modal.find('form');
        var $progress = this.$modal.find('#progress');
        var $success = this.$modal.find('#success');
        var $error = this.$modal.find('#error');
        var $buttonSubmit = this.$modal.find('button:submit');

        $form.on('submit', function (event) {
            event.preventDefault();

            var type = 'add' === that.options.type ? 'POST' : 'PUT';

            var request = $.ajax({
                url: $form.attr('action'),
                type: type,
                data: $form.serialize(),
                beforeSend: function () {
                    $form.hide();
                    $buttonSubmit.hide();
                    $progress.show();
                }
            });

            request.always(function () {
                $progress.hide();
            });

            request.done(function (data) {
                $success.show();

                that.$element.trigger('submit-done.modal-form', [that.$modal, data]);

                setTimeout(function() { that.$modal.modal('hide') }, 1000);
            });

            request.fail(function (jqXHR) {
                if (400 === jqXHR.status) {
                    $form.html($(jqXHR.responseText).find('form').html());
                    $form.show();
                    $buttonSubmit.show();
                } else {
                    $error.show();
                }
            });
        });
    };

    function Plugin(option) {
        return this.each(function () {
            var options = $.extend({}, ModalForm.DEFAULTS, option);

            new ModalForm(this, options);
        });
    }

    $.fn.modalForm = Plugin;
}(jQuery));
