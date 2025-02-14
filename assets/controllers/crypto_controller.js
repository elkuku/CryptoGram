import {Controller} from '@hotwired/stimulus'

export default class extends Controller {

    static targets = ['letter', 'key', 'error', 'success']

    static values = {
        letters: Array,
        uniqueLetters: Array,
        hints: Array,
        hoorays: Array,
        errors: Number,
    }

    selectedLetter = -1
    solvedLetters = []

    connect() {
        console.log(this.hooraysValue[Math.floor(Math.random() * 5)])
        for (let target of this.keyTargets) {
            if (this.hintsValue.includes(target.textContent.trim())) {
                this._setButtonClass(target, 'btn-success')
            }
        }

        for (let hint of this.hintsValue) {
            // TODO mark a random letter (not the first one)
            for (let letter of this.lettersValue) {
                if (letter.letter === hint) {
                    this.solvedLetters.push(letter.index)
                    this._setLetter(letter.index, letter)
                    this._checkCompleted(hint)
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
            if (this.uniqueLettersValue.includes(key)) {
                this._guessLetter(key)
            }
        }
    }

    errorsValueChanged(e) {
        this.errorTarget.innerHTML = '❌'.repeat(e)
    }

    _selectNextLetter() {

        let found = false
        let check = this.selectedLetter + 1

        if (check === this.lettersValue.length) {
            check = 0
        }

        do {
            if (this.solvedLetters.includes(check)
                || this.lettersValue[check].isLetter === false) {
                check++
                if (check === this.lettersValue.length) {
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
            check = this.lettersValue.length - 1
        }

        do {
            if (this.solvedLetters.includes(check)
                || this.lettersValue[check].isLetter === false) {
                check--
                if (check < 0) {
                    check = this.lettersValue.length - 1
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
        const l = this.lettersValue[this.selectedLetter]

        if (this.solvedLetters.includes(l.index)) {
            return
        }

        if (letter === l.letter) {
            this.solvedLetters.push(l.index);
            this._setLetter(this.selectedLetter, l)
            if (false === this._checkCompleted(letter)) {
                this._selectNextLetter()
            }
        } else {
            this._updateField(this.selectedLetter, 'Not a ' + letter + '<br />' + l.code)
            this.errorsValue++
            // TODO: nicer error
        }
    }

    _setLetter(targetIndex, letter) {
        this.letterTargets[targetIndex].innerHTML = letter.letter + '<br />' + letter.code
    }

    _updateField(targetIndex, text) {
        this.letterTargets[targetIndex].innerHTML = text
    }

    _checkCompleted(letter) {
        for (let value of this.lettersValue) {
            if (value.letter === letter) {
                if (false === this.solvedLetters.includes(value.index)) {
                    for (let target of this.keyTargets) {
                        if (target.textContent.trim() === letter) {
                            this._setButtonClass(target, 'btn-success')
                        }
                    }

                    // Letters missing...
                    return false
                }
            }
        }

        // All letters found

        for (let target of this.keyTargets) {
            if (target.textContent.trim() === letter) {
                this._setButtonClass(target, 'btn-secondary')
            }
        }

        for (let value of this.lettersValue) {
            // Remove the "code" numbers from all fields of the "letter"
            if (value.letter === letter) {
                this.letterTargets[value.index].innerText = letter
                this.letterTargets[value.index].classList.remove('letter')
            }
        }

        for (let value of this.lettersValue) {
            if (value.isLetter && false === this.solvedLetters.includes(value.index)) {

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
}
