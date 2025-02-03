<?php

namespace App\Service;

use App\Type\Letter;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Filesystem\Filesystem;

class PhraseService
{
    private array $phrases;
    private array $stripChars = [' ', ',', '.', '\'', '‘', '’', ';', '-'];
    private array $specialChars = [
        'de' => ['Ä', 'Ö', 'Ü', 'ß']
    ];
    private string $lang = 'en';

    public function __construct(
        #[Autowire('%kernel.project_dir%')] private readonly string $projectDir,
    )
    {
    }

    public function setLang(string $lang): self
    {
        $this->lang = $lang;

        return $this;
    }

    public function getRandomPhrase(): string
    {
        if (!isset($this->phrases[$this->lang])) {

            $filesystem = new Filesystem();
            $contents = $filesystem->readFile($this->projectDir . "/assets/textfiles/phrases-$this->lang.txt");
            $this->phrases[$this->lang] = explode("\n", trim($contents));
        }

        return $this->phrases[$this->lang][array_rand($this->phrases[$this->lang])];
    }

    public function getUniqueLetters(string $phrase): array
    {
        $letters = array_unique(mb_str_split(mb_strtoupper($phrase)));

        return array_diff($letters, $this->stripChars);
    }

    /**
     * @return Letter[]
     */
    public function getLetters(string $phrase): array
    {
        $letters = mb_str_split(mb_strtoupper($phrase));

        $uniqueLetters = $this->getUniqueLetters($phrase);
        shuffle($uniqueLetters);

        $letterObjects = [];

        foreach ($letters as $i => $letter) {
            $letterObject = new Letter;
            $letterObject->index = $i;
            $letterObject->letter = $letter;
            if (in_array($letter, $this->stripChars, true)) {
                $letterObject->isLetter = false;
            } else {
                $letterObject->isLetter = true;
                $letterObject->code = array_search($letter, $uniqueLetters, true) + 1;
            }

            $letterObjects[] = $letterObject;
        }

        return $letterObjects;
    }

    public function getHints(array $letters, int $count): array
    {
        $hints = [];

        do {
            $hint = $letters[array_rand($letters)];
            if (false === in_array($hint, $hints, true)) {
                $hints[] = $hint;
            }
        } while (count($hints) < $count);

        return $hints;
    }

    public function getCharList(): array
    {
        return array_merge(range('A', 'Z'), $this->specialChars[$this->lang]);
    }
}
