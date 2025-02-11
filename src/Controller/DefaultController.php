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

        $locales = ['en', 'de', 'es'];

        return $this->render('default/index.html.twig', [
            'phrase' => $phrase,
            'letters' => $phraseService->getLetters($phrase),
            'unique_letters' => $uniqueLetters,
            'char_list' => $phraseService->getCharList(),
            'hints' => $phraseService->getHints($uniqueLetters, 5),
            'locale' => $localeSwitcher->getLocale(),
            'locales' => $locales,
        ]);
    }

    #[Route('/', methods: ['GET'])]
    public function indexNoLocale(): Response
    {
        return $this->redirectToRoute('app_default', ['_locale' => 'en']);
    }
}
