<?php

namespace App\Type;

class Letter
{
    public string $letter;
    public bool $isLetter;
    public int $code;
    public int $index;

    public function toHTML():string
    {
        if ($this->isLetter) {
            return '<br>'.$this->code;
        }

        return $this->letter;
    }
}
