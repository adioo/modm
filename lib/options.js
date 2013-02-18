/*
    ALL | type: ...,
    ALL | required: true,
    ALL | default: 'default'
    ALL | validate: function () {}, // | 'email', '...'
    ALL | manipulate: function () {},
    ALL | live: true,
    
    STR | pre: 'tru', => check string
    STR | post: 'cken', => check string
    STR | charStyle: 'normal', // normal | uppercase | lowercase => convert to function name
    STR | trim: true, => convert to boolean
    STR,BUF,ARY | maxLength: 5, => set to zero, if the number is negative
    STR,BUF,ARY | minLength: 1, => set to zero, if the number is negative
    NUM | max: 5, => check number, convert to number
    NUM | min: -3 => check number, convert to number
*/

var Validator = require('./validator');

function checkString (string) {
    
    if (typeof string === 'string') {
        return string;
    }
    
    return string.toString();
}

function toNumber (number) {
    
    if (typeof number === 'number') {
        return number;
    }
    
    if (typeof number === 'string' && number.match(/\./)) {
        return parseFloat(number, 10) || 0;
    }
    
    return parseInt(number, 10) || 0;
}

function checkLength (integer) {
        
    integer = parseInt(integer, 10) || 0;
    return integer < 0 ? 0 : integer;
}

function validate (type, validate) {
    
    // validation info
    if (typeof validate === 'function') {
        return validate;
    }
        
    // find a validation method in Validator
    if (typeof validate === "string") {
        
        if (Validator[validate]) {
            return Validator[validate];
        }
    }
    
    // use the default type validator
    if (Validator[type]) {
        return Validator[type];
    }
    
    throw new Error("No validation method found.");
}

function validateDefault (validate, value) {
    
    // validate default value
    if (validate && !validate(value)) {
        throw new Error("Invalid default value.");
    }
    
    return value;
}

function toBoolean (value) {
    return value ? true : false;
}

// type options
var options = {
    
    required: toBoolean,
    live: toBoolean,
    
    manipulate: function (value) {
        return typeof value === 'function' ? value : null;
    },
    
    charStyle: function (value) {
        
        value = value.toLowerCase();
        
        if (value === 'lowercase') {
            return 'toLowerCase';
        }
        
        if (value === 'uppercase') {
            return 'toUpperCase';
        }
        
        return null;
    },
    
    trim: toBoolean,
    pre: checkString,
    post: checkString,
    maxLength: checkLength,
    minLength: checkLength,
    max: toNumber,
    min: toNumber
};

// schema (return options)
exports.prepare = function (opts) {
    
    // define default item
    var _options = {type: opts.type};
    
    // prepare options
    for (var fn in options) {
        if (opts[fn]) {
            _options[fn] = options[fn](opts[fn]);
        }
    }
    
    // special preparers
    _options.validate = validate(opts.type, opts.validate);
    _options.default = opts.default ? validateDefault(_options.validate, opts.default) : null;
    
    return _options;
};