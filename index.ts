var fs = require('fs');


var TEXT_PREVIEW_MAX_SIZE = 150 // Кол-во символов с текстом, выводимых в консоль 
var CONFIDENCE_VALUE = 0.01
interface letter_frequency {
    letter: string;
    frecuency: number;
}
class Alphabet {
    constructor(path_to_alphabet_file: string) {
        this.alphabetWithFrequency = Object.entries(JSON.parse(fs.readFileSync(path_to_alphabet_file, 'utf8')))
            .map(([letter, frecuency]) =>
                ({ letter: letter, frecuency: (frecuency as number) }));
    }
    alphabetWithFrequency: Array<letter_frequency>;
}
function main() {
    //let alphabet = JSON.parse(fs.readFileSync('russian_alphabet.json', 'utf8'));
    //console.log(alphabet);
    let textObj = JSON.parse(fs.readFileSync("russian_input.json", 'utf8'));
    console.log(`Исходный текст (на русском): ${textObj.text.slice(0, TEXT_PREVIEW_MAX_SIZE)}...`);
    console.log(`Ключ шифрования: ${textObj.key}`);
    let russian_alphabet: Alphabet = new Alphabet("russian_alphabet.json");

    console.log(`Русский алфавит с частотностью: \n${russian_alphabet.alphabetWithFrequency.map(e => `${e.letter} : ${e.frecuency}\n`)}`);
    let russian_encrypt_text = caesar_algorithm(textObj.text, textObj.key,
        russian_alphabet, true);
    console.log(`Зашифрованный текст: ${russian_encrypt_text}`);

    let russian_decrypted_by_brute_force = decrypt_by_brute_force(
        russian_encrypt_text,
        russian_alphabet
    );
    console.log(`Обратно расшифрованный текст(метод грубой силы): ${russian_decrypted_by_brute_force.slice(0, TEXT_PREVIEW_MAX_SIZE)}...`);

    //--//
    let EnglishTextObject = JSON.parse(fs.readFileSync("english_input.json", 'utf8'));

    console.log(`Исходный текст (на английском): ${EnglishTextObject.text.slice(0, TEXT_PREVIEW_MAX_SIZE)}...`);

    console.log(`Ключ шифрования: ${EnglishTextObject.key}`);

    let english_alphabet = new Alphabet("english_alphabet.json");

    console.log(`Английский алфавит с частотностью: \n${english_alphabet.alphabetWithFrequency.map(e => `${e.letter} : ${e.frecuency}\n`)}`);
    let english_encrypt_text = caesar_algorithm(
        EnglishTextObject.text,
        EnglishTextObject.key,
        english_alphabet,
        true
    );
    console.log(`Зашифрованный текст: ${english_encrypt_text.slice(0, TEXT_PREVIEW_MAX_SIZE)}...`);
    let english_decrypted_by_brute_force = decrypt_by_frequency_analysis(
        english_encrypt_text,
        english_alphabet
    );
    console.log(`Обратно расшифрованный текст (метод частотного анализа): ${english_decrypted_by_brute_force.slice(0, TEXT_PREVIEW_MAX_SIZE)}...`);

}



function caesar_algorithm(text: string, key: number, alphabet: Alphabet, encrypt: boolean) {
    let encrypt_letter: string = "";
    let result_text = "";
    for (let i = 0; i < text.length; i++) {
        if (alphabet.alphabetWithFrequency.find((e) => e.letter === text[i]) === undefined) {
            result_text += text[i];
        }
        else if (alphabet.alphabetWithFrequency.find((e) => e.letter === text[i])) {
            let encrypt_letter = _shift_letter(text[i], key, alphabet, encrypt);
            if (text[i] === text[i].toUpperCase()) {
                encrypt_letter = encrypt_letter.toUpperCase();
            }
            result_text += encrypt_letter;
        }
    }
    return result_text;
}
function decrypt_by_brute_force(encrypt_text: string, alphabet: Alphabet) {
    let decrypted_text = "";
    let letters = alphabet.alphabetWithFrequency.map((e) => e.letter);
    for (let key_ = 0; key_ < letters.length; key_++) {
        decrypted_text = caesar_algorithm(
            encrypt_text,
            key_,
            alphabet,
            false
        );
        if (_is_decrypted_text(
            decrypted_text,
            alphabet
        )) {
            return decrypted_text;
        }
    }
    return " не удалось расшифровать "

}
function _is_decrypted_text(text: string, alphabet: Alphabet) {
    text = text.toLowerCase();
    let alphabet_frequency = alphabet.alphabetWithFrequency.map((e) => e.frecuency);
    let alphabet_letters = 0;
    for (let i = 0; i < text.length; i++) {
        if (alphabet.alphabetWithFrequency.find((e) => e.letter === text[i]))
            alphabet_letters++;
    }
    const text_frequency = alphabet.alphabetWithFrequency.map((e) => {
        return {
            letter: e.letter,
            frecuency: (() => {
                let count = 0;
                for (let i = 0; i < text.length; i++) { if (text[i].toLowerCase() === e.letter) count++ }
                return count / text.length;
            })()
        }
    })
    let total_difference = 0;
    for (let i = 0; i < text_frequency.length; i++) {
        total_difference += (alphabet_frequency[i] - text_frequency[i].frecuency) ** 2;
    }
    return total_difference <= CONFIDENCE_VALUE;


}

function decrypt_by_frequency_analysis(encrypt_text: string, alphabet: Alphabet) {
    let text = encrypt_text.toLowerCase()  // Гарантируем строчные буквы
    let alphabet_frequency = alphabet.alphabetWithFrequency.map(e => e.frecuency);
    let alphabet_letters = 0;
    for (let i = 0; i < text.length; i++) {
        if (alphabet.alphabetWithFrequency.find((e) => e.letter === text[i]))
            alphabet_letters++;
    }
    const text_frequency = alphabet.alphabetWithFrequency.map((e) => {
        return {
            letter: e.letter,
            frecuency: (() => {
                let count = 0;
                for (let i = 0; i < text.length; i++) { if (text[i].toLowerCase() === e.letter) count++ }
                return count / text.length;
            })()
        }
    })

    let index_from_alphabet = alphabet.alphabetWithFrequency
        .findIndex(e => e.letter === alphabet.alphabetWithFrequency
            .find(e => e.frecuency === Math.max(...alphabet_frequency)).letter);
    let index_from_text = alphabet.alphabetWithFrequency
        .findIndex(e => e.letter === text_frequency
            .find(e => e.frecuency === Math.max(...text_frequency.map(e => e.frecuency))).letter);
    let encrypt_ = index_from_alphabet > index_from_text ? true : false;
    let key_ = Math.abs(index_from_alphabet - index_from_text);
    return caesar_algorithm(encrypt_text, key_, alphabet, encrypt_);
}

function _shift_letter(letter: string, key: number,
    alphabet: Alphabet, encrypt: boolean) {
    let shifted_index: number;
    let _alphabet = alphabet.alphabetWithFrequency.map((e) => e.letter.toLowerCase());
    letter = letter.toLowerCase();
    shifted_index = _alphabet.findIndex((e) => e === letter);
    for (let i = 0; i < key; i++) {
        shifted_index = encrypt ? shifted_index + 1 : shifted_index - 1;
        if (shifted_index >= _alphabet.length) {
            shifted_index = 0;
        }
        if (shifted_index < 0) {
            shifted_index = _alphabet.length - 1;
        }
    }
    return _alphabet[shifted_index];
}

main();