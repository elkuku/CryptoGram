<?php

namespace App\Controller;

use App\Service\PhraseService;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Translation\LocaleSwitcher;

class DefaultController extends BaseController
{
    #[Route('/{_locale<%app.supported_locales%>}/', name: 'app_default', methods: ['GET'])]
    public function index(
        PhraseService  $phraseService,
        LocaleSwitcher $localeSwitcher,
    ): Response
    {
        $phraseService->setLang($localeSwitcher->getLocale());
        $phrase = $phraseService->getRandomPhrase();

        $uniqueLetters = $phraseService->getUniqueLetters($phrase);

        return $this->render('default/index.html.twig', [
            'phrase' => $phrase,
            'noLetters' => $phraseService->getStripChars(),

            'letters' => $phraseService->getLetters($phrase),
            'uniqueLetters' => array_values($uniqueLetters),
            'charList' => $phraseService->getCharList(),
            'locale' => $localeSwitcher->getLocale(),
        ]);
    }

    #[Route('/', methods: ['GET'])]
    public function indexNoLocale(): Response
    {
        return $this->redirectToRoute('app_default', ['_locale' => 'en']);
    }
}
