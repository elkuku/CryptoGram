<?php

namespace App\Controller;

use App\Service\PhraseService;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/', name: 'app_default', methods: ['GET'])]
class DefaultController extends BaseController
{
    public function __invoke(
        #[Autowire('%kernel.project_dir%')] string $projectDir,
        PhraseService                              $phraseService,
    ): Response
    {
        $lang = 'de';
        $lang = 'es';
        $phraseService->setLang($lang);
        $phrase = $phraseService->getRandomPhrase();

        $uniqueLetters = $phraseService->getUniqueLetters($phrase);

        return $this->render('default/index.html.twig', [
            'phrase' => $phrase,
            'letters' => $phraseService->getLetters($phrase),
            'unique_letters' => $uniqueLetters,
            'char_list' => $phraseService->getCharList(),
            'hints' => $phraseService->getHints($uniqueLetters, 5),
        ]);
    }
}
