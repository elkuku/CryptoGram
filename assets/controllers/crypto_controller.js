import {Controller} from '@hotwired/stimulus'

export default class extends Controller {

    static targets = ['letter', 'key', 'error', 'errorContainer', 'success']

    static values = {
        phrase: String,
        noLetters: Array,
        hoorays: Array,
        errors: Number,
    }

    letters = []
    uniqueLetters = []
    selectedLetter = -1
    solvedLetters = []

    connect() {
        this.letters = [...this.phraseValue.toUpperCase()]

        this.uniqueLetters = this.letters
            .filter((value, index, array) => array.indexOf(value) === index)
            .filter((value) => false === this.noLettersValue.includes(value))
            .sort(() => .5 - Math.random())

        const hints = []
        const maxHints = 5

        do {
            let hint = this.uniqueLetters[Math.floor(Math.random() * this.uniqueLetters.length)];
            if (false === hints.includes(hint)) {
                hints.push(hint)
            }
        } while (hints.length < maxHints);

        for (const [index, letter] of this.letters.entries()) {
            if (this._isLetter(letter)) {
                this._setLetter(index, '&nbsp;&nbsp;&nbsp;', this._getCode(letter))
            } else {
                this._setLetter(index, letter, null)
            }
        }

        for (let target of this.keyTargets) {
            if (this.uniqueLetters.includes(target.textContent.trim())) {
                this._setButtonClass(target, 'btn-info');
            } else {
                this._setButtonClass(target, 'btn-outline-secondary');
                target.setAttribute('disabled', 'disabled')
            }
        }

        for (let hint of hints) {
            // TODO mark a random letter (not the first one)
            for (let [index, letter] of this.letters.entries()) {
                if (letter === hint) {
                    this.solvedLetters.push(index)
                    this._setLetter(index, letter, this._getCode(letter))
                    this._isCompleted(hint)
                    break
                }
            }
        }

        this._selectNextLetter()
    }

    selectLetter(event) {
        if (this.solvedLetters.includes(event.params.index)) {
            return
        }

        if (false === this._isLetter(this.letters[event.params.index])) {
            return
        }

        this._selectLetter(event.params.index)
    }

    guessLetter(event) {
        if (null === this.selectedLetter) {
            console.error('Please select a letter')

            return;
        }

        this._guessLetter(event.params.letter)
    }

    handleKeyDown(event) {
        if ('ArrowRight' === event.key) {
            this._selectNextLetter()
        } else if ('ArrowLeft' === event.key) {
            this._selectPreviousLetter()
        } else {
            const key = event.key.toUpperCase()
            if (this.uniqueLetters.includes(key)) {
                this._guessLetter(key)
            }
        }
    }

    errorsValueChanged(e) {
        this.errorTarget.innerHTML = '❌'.repeat(e)
        if (e) {
            this.errorContainerTarget.style.display = 'block';
        }
    }

    _selectNextLetter() {

        let found = false
        let check = this.selectedLetter + 1

        if (check === this.letters.length) {
            check = 0
        }

        do {
            if (this.solvedLetters.includes(check)
                || this._isLetter(this.letters[check]) === false) {
                check++
                if (check === this.letters.length) {
                    check = 0
                }
            } else {
                this._selectLetter(check)
                found = true
            }
        } while (!found)
    }

    _selectPreviousLetter() {

        let found = false
        let check = this.selectedLetter - 1

        if (check === -1) {
            check = this.letters.length - 1
        }

        do {
            if (this.solvedLetters.includes(check)
                || this._isLetter(this.letters[check]) === false) {
                check--
                if (check < 0) {
                    check = this.letters.length - 1
                }
            } else {
                this._selectLetter(check)
                found = true
            }
        } while (!found)
    }

    _selectLetter(index) {
        this._unselectLetters()

        this.letterTargets[index].classList.add('letter-selected')

        this.selectedLetter = index
    }

    _unselectLetters() {
        for (let target of this.letterTargets) {
            target.classList.remove('letter-selected')
        }
    }

    _guessLetter(letter) {
        if (this.solvedLetters.includes(this.selectedLetter)) {
            return
        }

        this._setLetter(this.selectedLetter, letter, this._getCode(letter))

        if (letter === this.letters[this.selectedLetter]) {
            this.solvedLetters.push(this.selectedLetter);
            this._setLetterError(false)
            if (false === this._isCompleted(letter)) {
                this._selectNextLetter()
            }
        } else {
            this._setLetterError()
            this.errorsValue++
            // TODO: nicer error
        }
    }

    _setLetter(targetIndex, letter, code) {
        this.letterTargets[targetIndex].innerHTML = code
            ? '<div class="letterContainer">' + letter + '</div>' + code
            : letter
    }

    _isCompleted(letter) {
        for (let [index, value] of this.letters.entries()) {
            if (value === letter) {
                if (false === this.solvedLetters.includes(index)) {
                    for (let target of this.keyTargets) {
                        if (target.textContent.trim() === letter) {
                            this._setButtonClass(target, 'btn-success')
                        }
                    }

                    // Letters "X" missing...
                    return false
                }
            }
        }

        // All letters "X" found

        for (let target of this.keyTargets) {
            if (target.textContent.trim() === letter) {
                this._setButtonClass(target, 'btn-secondary')
                break
            }
        }

        // Remove the "code" numbers from all fields of the letter "X"
        for (let [index, value] of this.letters.entries()) {
            if (value === letter) {
                this.letterTargets[index].innerText = letter
                this.letterTargets[index].classList.remove('letter')
            }
        }

        // Check ALL letters
        for (let [index, value] of this.letters.entries()) {
            if (this._isLetter(value) && false === this.solvedLetters.includes(index)) {

                // Letters missing...
                return false
            }
        }

        // Everything is solved!

        this._unselectLetters()
        this.successTarget.style.display = 'block'

        this.successTarget.innerText = this.hooraysValue[Math.floor(Math.random() * 5)]

        // TODO: more JUHUUUUU =;)

        return true
    }

    _setButtonClass(element, className) {
        element.classList.remove('btn-success')
        element.classList.remove('btn-secondary')
        element.classList.remove('btn-info')
        element.classList.add(className)
    }

    _isLetter(letter) {
        return !this.noLettersValue.includes(letter)
    }

    _getCode(letter) {
        return this.uniqueLetters.indexOf(letter) + 1
    }

    _setLetterError(error = true) {
        if (error) {
            this.letterTargets[this.selectedLetter].classList.add('letter-error')
        } else {
            this.letterTargets[this.selectedLetter].classList.remove('letter-error')
        }
    }
}
