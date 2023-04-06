function Validator(formSelector) {

    var _this = this;

    function getParent(inputElement, selector) {
        while (inputElement.parentElement) {
            if (inputElement.parentElement.matches(selector)) {
                return inputElement.parentElement;
            }
            inputElement = inputElement.parentElement
        }
    }

    var formRules = {};

    var validatorRules = {
        required: function (value) {
            return value ? undefined : 'Please enter this field!';
        },
        email: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Wrong format email!'
        },
        min: function (minLength) {
            return function (value) {
                return value.length >= minLength ? undefined : `Please enter ${minLength} characters at least`
            }
        },
        max: function (maxLength) {
            return function (value) {
                return value.length < maxLength ? undefined : `Please enter less than ${maxLength} characters`
            }
        },
        confirm: function (value) {
            var getConfirmedValue = document.querySelector('#register-form #password').value;
            return value === getConfirmedValue ? undefined : 'Repeat password doesn\'t match!'
        }
    };



    var formElement = document.querySelector(formSelector)
    if (formElement) {

        var inputs = formElement.querySelectorAll('[name][rules]');

        for (var input of inputs) {
            var rules = input.getAttribute('rules').split('|');

            for (var rule of rules) {

                var ruleInfor;
                var isRuleHasValue = rule.includes(':')

                if (isRuleHasValue) {
                    ruleInfor = rule.split(':')
                    rule = ruleInfor[0];
                }

                var ruleFunc = validatorRules[rule]

                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfor[1])
                }

                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc);
                } else {
                    formRules[input.name] = [ruleFunc];
                }
            }


            //Handle events
            input.onblur = handleValidate;
            input.oninput = handleTextChange;
        }

        function handleValidate(event) {
            var rules = formRules[event.target.name];
            var errorMessage;

            for (var rule of rules) {
                errorMessage = rule(event.target.value);
                if (errorMessage) break;
            }

            if (errorMessage) {
                var formGroup = getParent(event.target, '.form-group');

                if (formGroup) {
                    var formMessage = formGroup.querySelector('.form-message');
                    formGroup.classList.add('invalid');

                    if (formMessage) {
                        formMessage.innerText = errorMessage
                    }
                }
            }
            return !errorMessage
        }

        function handleTextChange(event) {
            var formGroup = getParent(event.target, '.form-group');
            if (formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid')
                var formMessage = formGroup.querySelector('.form-message');

                if (formMessage) {
                    formMessage.innerText = ''
                }
            }
        }
    }

    // handle Submit form
    formElement.onsubmit = function (event) {
        event.preventDefault();

        var inputs = formElement.querySelectorAll('[name][rules]');

        var isValid = true

        for (var input of inputs) {
            if (!handleValidate({ target: input })) {
                isValid = false
            }
        }

        if (isValid) {      
            if (typeof _this.onSubmit === 'function') {

                var formEnableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(formEnableInputs).reduce(function (values, input) {

                        switch (input.type) {
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    values[input.name] = '';
                                    return values;
                                } 

                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value)
                                break;
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="'+input.name+'"]:checked').value;
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value
                        }

                        return values;
                    }, {})

                _this.onSubmit(formValues);
            } else {
                formElement.submit();
            }

        }
    }
}