//==============================================================================
// language_utils.js
//==============================================================================
//==============================================================================
// Functions to assist in NLG
//==============================================================================

//==============================================================================
// External Interface (functions intended to be public)
//==============================================================================
// ordinalNumerFor
//==============================================================================

//==============================================================================
// Direct Dependencies
//==============================================================================
// 
//==============================================================================

//==============================================================================
// Standalone utils
//==============================================================================
//------------------------------------------------------------------------------

/* Returns a string containing an ordinal numeral for the given non-negative integer.
 * 
 * n: a non-negative integer in the range [0, ]
 * 
 */
function ordinalNumeralFor(n) {
    if (!(n >= 0 && Number.isInteger(n))) {
        console.log("[Warning] ordinalNumeralFor - ", n, "is not a non-negative integer.");
        return false;
    }

    if (n === 0) {
        return "zeroth";
    }

    let result = "";

    // Contains 1-20, and all multiples of 10 which are less than 100.
    // Also contains 0, but maps to the empty string because 
    // a zero in any position of a non-zero integer is not included in the English description.
    const limitedNumberToOrdinalMap = new Map([
        [0, ""],
        [1, "first"],
        [2, "second"],
        [3, "third"],
        [4, "fourth"],
        [5, "fifth"],
        [6, "sixth"],
        [7, "seventh"],
        [8, "eighth"],
        [9, "ninth"],
        [10, "tenth"],
        [11, "eleventh"],
        [12, "twelfth"],
        [13, "thirteenth"],
        [14, "fourteenth"],
        [15, "fifteenth"],
        [16, "sixteenth"],
        [17, "seventeenth"],
        [18, "eighteenth"],
        [19, "nineteenth"],
        [20, "twentieth"],
        [30, "thirtieth"],
        [40, "fourtieth"],
        [50, "fiftieth"],
        [60, "sixtieth"],
        [70, "seventieth"],
        [80, "eightieth"],
        [90, "ninetieth"]
    ]);

    // Handle final two digits
    const finalTwoDigits = n % 100;

    if (finalTwoDigits <= 20 || finalTwoDigits % 10 === 0) {
        result = limitedNumberToOrdinalMap.get(finalTwoDigits);
    } else {
        const onesValue = n % 10;
        const tensValue = finalTwoDigits - onesValue;
        result = numberToEnglish(tensValue) + "-" + limitedNumberToOrdinalMap.get(onesValue);
    }

    // Handle remaining digits. Simply add the natural language term to the beginning.
    if (n >= 100) {
        if (result === "") {
            result = "th";
        } else {
            result = " " + result;
        }
        result = numberToEnglish(n - finalTwoDigits) + result;
    }

    return result;
    
}

/* Returns a string containing the English term for the given non-negative integer.
 * 
 * n: a non-negative integer in the range [0, (10^6)-1]
 * 
 */
function numberToEnglish(n) {
    if (!(n >= 0 && Number.isInteger(n))) {
        console.log("[Warning] numberToEnglish - ", n, "is not a non-negative integer.");
        return false;
    }

    if (n >= 1000000) {
        console.log("[Warning] numberToEnglish - ", n, "is outside the maximum range.");
        return false;
    }

    if (n === 0) {
        return "zero";
    }

    let result = "";

    // Contains 1-20, and all multiples of 10 which are less than 100.
    // Also contains 0, but maps to the empty string because 
    // a zero in any position of a non-zero integer is not included in the English description.
    const limitedNumberToEnglishMap = new Map([
        [0, ""],
        [1, "one"],
        [2, "two"],
        [3, "three"],
        [4, "four"],
        [5, "five"],
        [6, "six"],
        [7, "seven"],
        [8, "eight"],
        [9, "nine"],
        [10, "ten"],
        [11, "eleven"],
        [12, "twelve"],
        [13, "thirteen"],
        [14, "fourteen"],
        [15, "fifteen"],
        [16, "sixteen"],
        [17, "seventeen"],
        [18, "eighteen"],
        [19, "nineteen"],
        [20, "twenty"],
        [30, "thirty"],
        [40, "forty"],
        [50, "fifty"],
        [60, "sixty"],
        [70, "seventy"],
        [80, "eighty"],
        [90, "ninety"],
    ]);

    // Get the term for the final 2 digits. This is the same regardless of the rest of the number.
    const finalTwoDigits = n % 100;
    
    if (finalTwoDigits <= 20 || finalTwoDigits % 10 === 0) {
        result += limitedNumberToEnglishMap.get(finalTwoDigits);
    } else {
        // Tens value must be >= 20, and ones value must be 1-9
        const onesValue = n % 10;
        const tensValue = n % 100 - onesValue;
        result += numberToEnglish(tensValue) + "-" +numberToEnglish(onesValue);
    }

    // Handle hundreds digit
    const hundredsDigit = ((n % 1000) - (n%100))/100;
    if (n >= 100 && hundredsDigit != 0) {
        if (result !== "") {
            result = " " + result; 
        }
        result = numberToEnglish(hundredsDigit) + " hundred" + result;
    }

    // Handle number of thousands
    const numberOfThousands = ((n % 1000000) - (n % 1000))/1000;
    if (n >= 1000 & numberOfThousands != 0) {
        if (result !== "") {
            result = " " + result;
        }
        result = numberToEnglish(numberOfThousands) + " thousand" + result;
    }


    return result;
}