import {Controller} from '@hotwired/stimulus';

export default class extends Controller {

    static targets = ['letter', 'key'];

    static values = {
        letters: Array,
        hints: Array,
    }

    selectedLetter = null
    solvedLetters = []

    connect() {
        // console.log(this.lettersValue)
        // console.log(this.hintsValue)
        // console.log(this.keyTargets)
        //console.log(this.letterTargets)
        //console.error('connecting...')
        for (let target of this.keyTargets) {
            if (this.hintsValue.includes(target.textContent.trim())) {
                this._setButtonClass(target, 'btn-success')
            }
        }

        for (let hint of this.hintsValue) {
            for (let letter of this.lettersValue) {
                if (letter.letter === hint) {
                    this.solvedLetters.push(letter.index)
                    this._setLetter(letter.index, letter)
                    this._checkLetterCompleted(hint)
                    break
                }
            }
        }
    }

    selectLetter(event) {
        if (this.solvedLetters.includes(event.params.index)) {
            return
        }
        console.log('selectLetter', event);
        console.log('selectLetter index', event.params.index);
        for (let target of this.letterTargets) {
            target.classList.remove('letter-selected');
            target.classList.add('letter');
        }

        event.target.classList.remove('letter');
        event.target.classList.add('letter-selected');

        this.selectedLetter = event.params.index;
    }

    guessLetter(event) {
        console.log(event);

        if (null === this.selectedLetter) {
            console.error('Please select a letter');

            return;
        }
        const letter = this.lettersValue[this.selectedLetter]
        console.log(event.params.letter, letter.letter);
        if (event.params.letter === letter.letter) {
            this.solvedLetters.push(letter.index)
            this._setLetter(this.selectedLetter, letter)
            this._checkLetterCompleted(event.params.letter)
        } else {
            this._updateField(this.selectedLetter, 'no')

        }

        console.log(this.selectedLetter);

        console.log(this.letterTargets[this.selectedLetter])
        console.log(this.lettersValue[this.selectedLetter])
        //this._setLetter(this.selectedLetter, this.lettersValue[this.selectedLetter]);
    }

    _setLetter(targetIndex, letter) {
        this.letterTargets[targetIndex].innerHTML = letter.letter + '<br />' + letter.code;
    }

    _updateField(targetIndex, text) {
        this.letterTargets[targetIndex].innerHTML = text;
    }

    _checkLetterCompleted(check) {
        console.log('checkLetter', check);
        for (let letter of this.lettersValue) {
            if (letter.letter === check) {
                if (false === this.solvedLetters.includes(letter.index)) {
                    console.log('missing ' + check)
                    for (let target of this.keyTargets) {
                        if (check===target.textContent.trim()) {
                            this._setButtonClass(target, 'btn-success')
                        }
                    }
                    return;
                } else {
                    console.log('found ' + check)
                }
            }
        }
        console.log('completed' + check)
        for (let target of this.keyTargets) {
            if (check===target.textContent.trim()) {
                this._setButtonClass(target, 'btn-secondary')
            }
        }
    }

    _setButtonClass(element, className) {
        element.classList.remove('btn-success')
        element.classList.remove('btn-secondary')
        element.classList.remove('btn-info')
        element.classList.add(className)
    }
}
