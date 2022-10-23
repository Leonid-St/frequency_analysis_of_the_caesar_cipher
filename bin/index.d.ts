declare var fs: any;
declare var TEXT_PREVIEW_MAX_SIZE: number;
declare var CONFIDENCE_VALUE: number;
interface letter_frequency {
    letter: string;
    frecuency: number;
}
declare class Alphabet {
    constructor(path_to_alphabet_file: string);
    alphabetWithFrequency: Array<letter_frequency>;
}
declare function main(): void;
declare function caesar_algorithm(text: string, key: number, alphabet: Alphabet, encrypt: boolean): string;
declare function decrypt_by_brute_force(encrypt_text: string, alphabet: Alphabet): string;
declare function _is_decrypted_text(text: string, alphabet: Alphabet): boolean;
declare function decrypt_by_frequency_analysis(encrypt_text: string, alphabet: Alphabet): string;
declare function _shift_letter(letter: string, key: number, alphabet: Alphabet, encrypt: boolean): string;
