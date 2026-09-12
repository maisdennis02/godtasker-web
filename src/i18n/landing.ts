import { useCallback, useEffect, useRef, useState } from 'react'

// Minimal i18n for the public landing + beta pages. The app itself stays
// English for now; if app-wide i18n lands later, add dictionaries here — the
// mechanism (typed keys + hook) already scales.

export type Locale = 'en' | 'pt'

const en = {
  // nav
  navHow: 'How it works',
  navFeatures: 'Features',
  navUseCases: 'Use cases',
  navBeta: 'Beta',
  navLogIn: 'Log in',
  navSignUp: 'Join the beta',

  // hero
  statusPill: 'Open beta on Android · Google Play',
  heroTitle: 'Send a task, not a message.',
  heroSubtitle:
    'Checklist, deadline, photo proof and approval — the task lands on the other person’s phone and you follow it live.',
  heroCta: 'Test it on Android',
  heroSecondary: 'Use it in the browser',
  heroNote: 'Free · no ads · English & Portuguese · iOS coming later',
  shotSentAlt: 'Sent tasks: your task, not started yet, with its 5-item checklist',
  shotReceivedAlt: 'Received task with a checklist being ticked off',
  shotFormAlt: 'New task form with subtasks, due date and “require my approval”',
  screenTabYou: 'You see',
  screenTabThem: 'They see',
  screenTabForm: 'New task',
  screenCapYou: 'Your sent task — tap the card to see the checklist they’ll tick off.',
  screenCapThem: 'The task arrives — they start it and tick items off one by one.',
  screenCapForm: 'Checklist, deadline, photo proof and approval in a single form.',
  screenZoom: 'Enlarge',
  screenClose: 'Close',

  // how it works
  howTitle: 'How it works',
  howSubtitle: 'Not a personal to-do list — every task travels from you to someone else.',
  howStep1Title: 'You build the task',
  howStep1Body:
    'Title, checklist, due date. Switch on “require a photo” or “require my approval” if you want.',
  howStep2Title: 'It lands on their phone',
  howStep2Body:
    'On the phone of whoever does it — not on your list. They start it and tick off each item; you see it live.',
  howStep3Title: 'You approve — or send it back',
  howStep3Body:
    'Saw the photo, checked it? Approve. Not right? Reopen with written feedback; every round stays in the history.',

  // features
  featuresTitle: 'What’s in the app today',
  featuresSubtitle: 'No boards, no projects, no setup. A task, a person, a deadline.',
  featChecklistTitle: 'Checklist per task',
  featChecklistBody: 'Every item is a checkbox; progress shows up on your side the moment it’s ticked.',
  featDeadlineTitle: 'Deadlines and duration',
  featDeadlineBody: 'Due date, “due today” badges, and fixed-length tasks that keep due = start + duration.',
  featPhotoTitle: 'Photo proof',
  featPhotoBody: 'The task can only be completed with a photo attached. No “trust me”.',
  featApprovalTitle: 'Approve or reopen',
  featApprovalBody:
    'The task only closes when you approve it. Send it back with feedback — the history keeps each round.',
  featChatTitle: 'Chat and notifications',
  featChatBody: 'A conversation per task and a push notification at every step.',
  featOfferTitle: 'Offerings',
  featOfferBody:
    'Publish services with price, duration, dates and seats; a request becomes a task automatically.',

  // beta
  betaTitle: 'Test the beta on Android',
  betaSubtitle:
    'We’re in Google Play’s closed testing. Three steps, about a minute — and the app needs to stay installed for 14 days (you don’t have to open it every day).',
  betaStep1Title: 'Join the tester group',
  betaStep1Body: 'A Google Group. Joining only tells Google Play you’re a tester.',
  betaStep1Cta: 'Join the group',
  betaStep2Title: 'Accept the tester invite',
  betaStep2Body: 'Use the same Google account you joined the group with.',
  betaStep2Cta: 'Become a tester',
  betaStep3Title: 'Install from the Play Store',
  betaStep3Body: 'It shows up like any other app. Updates arrive automatically.',
  betaStep3Cta: 'Install LalaTask',
  betaNote: 'Step 1 comes first — otherwise step 2 says the app isn’t available.',
  betaIphone: 'On an iPhone? Use LalaTask in the browser until the iOS version ships.',
  betaFeedback: 'Something confusing or broken? We’d rather hear it:',
  betaBack: 'Back to lalatask.com',

  // use cases
  useCasesTitle: 'Where it fits',
  useCasesSubtitle: 'Six ways people use LalaTask.',
  sectorHouseholdTitle: 'Household & errands',
  sectorHouseholdBody:
    'Send the grocery run as a checklist — and watch items get ticked off in real time.',
  sectorFamilyTitle: 'Family & caregiving',
  sectorFamilyBody: 'Coordinate care for the people you love, with photo-confirmed check-ins.',
  sectorBusinessTitle: 'Small-business delegation',
  sectorBusinessBody: 'Task your assistant or contractor — no onboarding, full oversight.',
  sectorFreelanceTitle: 'Freelance & creative services',
  sectorFreelanceBody: 'Publish your services as offerings; your profile is your storefront.',
  sectorTutoringTitle: 'Tutoring & lessons',
  sectorTutoringBody: 'Lesson packages with homework checklists and chat between classes.',
  sectorFitnessTitle: 'Fitness & coaching',
  sectorFitnessBody: 'Weekly plans as checklists, points for consistency, chat for form checks.',

  // CTA band
  ctaTitle: 'Help launch LalaTask',
  ctaBody: 'Every tester counts toward leaving the beta. It takes a minute.',
  ctaButton: 'I want to test it',

  // footer
  footerTagline: 'send a task, not a message',
  footerPrivacy: 'Privacy',
  footerTerms: 'Terms',
  footerDeleteAccount: 'Delete account',
}

// Record<keyof typeof en, string> makes tsc reject missing or extra keys.
const pt: Record<keyof typeof en, string> = {
  navHow: 'Como funciona',
  navFeatures: 'Recursos',
  navUseCases: 'Casos de uso',
  navBeta: 'Beta',
  navLogIn: 'Entrar',
  navSignUp: 'Quero testar',

  statusPill: 'Beta aberto no Android · Google Play',
  heroTitle: 'Mande uma tarefa, não uma mensagem.',
  heroSubtitle:
    'Checklist, prazo, foto de comprovação e aprovação — a tarefa chega no celular da outra pessoa e você acompanha em tempo real.',
  heroCta: 'Quero testar no Android',
  heroSecondary: 'Usar no navegador',
  heroNote: 'Grátis · sem anúncios · em português e inglês · iOS mais pra frente',
  shotSentAlt: 'Tarefas enviadas: sua tarefa ainda por fazer, com o checklist de 5 itens',
  shotReceivedAlt: 'Tarefa recebida com o checklist sendo marcado',
  shotFormAlt: 'Formulário de nova tarefa com subtarefas, prazo e “exigir minha aprovação”',
  screenTabYou: 'Você vê',
  screenTabThem: 'A pessoa vê',
  screenTabForm: 'Criar tarefa',
  screenCapYou: 'Sua tarefa enviada — toque no card e veja o checklist que a pessoa vai marcar.',
  screenCapThem: 'A tarefa chega — a pessoa inicia e vai marcando item por item.',
  screenCapForm: 'Checklist, prazo, foto de comprovação e aprovação num formulário só.',
  screenZoom: 'Ampliar',
  screenClose: 'Fechar',

  howTitle: 'Como funciona',
  howSubtitle: 'Não é uma lista de tarefas pessoal — cada tarefa vai de você para outra pessoa.',
  howStep1Title: 'Você monta a tarefa',
  howStep1Body:
    'Título, checklist, prazo. Ligue “exigir foto de comprovação” ou “exigir minha aprovação” se quiser.',
  howStep2Title: 'Ela chega no celular da pessoa',
  howStep2Body:
    'No celular de quem vai fazer — não na sua lista. A pessoa inicia e vai marcando cada item; você vê na hora.',
  howStep3Title: 'Você aprova — ou devolve',
  howStep3Body:
    'Viu a foto, conferiu? Aprova. Não ficou bom? Reabre com feedback escrito; cada rodada fica no histórico.',

  featuresTitle: 'O que já está no app',
  featuresSubtitle: 'Sem quadros, sem projetos, sem configuração. Uma tarefa, uma pessoa, um prazo.',
  featChecklistTitle: 'Checklist por tarefa',
  featChecklistBody: 'Cada item é um checkbox; o progresso aparece do seu lado assim que é marcado.',
  featDeadlineTitle: 'Prazo e duração',
  featDeadlineBody: 'Data de entrega, aviso de “vence hoje” e tarefas de duração fixa (entrega = início + duração).',
  featPhotoTitle: 'Foto de comprovação',
  featPhotoBody: 'A tarefa só conclui com a foto anexada. Sem “confia em mim”.',
  featApprovalTitle: 'Aprovar ou reabrir',
  featApprovalBody:
    'A tarefa só fecha quando você aprova. Devolva com feedback — o histórico guarda cada rodada.',
  featChatTitle: 'Chat e notificações',
  featChatBody: 'Uma conversa por tarefa e notificação no celular a cada passo.',
  featOfferTitle: 'Ofertas',
  featOfferBody:
    'Publique serviços com preço, duração, datas e vagas; o pedido vira tarefa automaticamente.',

  betaTitle: 'Teste a versão beta no Android',
  betaSubtitle:
    'Estamos no teste fechado do Google Play. São 3 passos, uns 60 segundos — e o app precisa ficar instalado por 14 dias (não precisa abrir todo dia).',
  betaStep1Title: 'Entre no grupo de testadores',
  betaStep1Body: 'É um Grupo do Google. Entrar só avisa a Play Store que você é testador.',
  betaStep1Cta: 'Entrar no grupo',
  betaStep2Title: 'Aceite o convite de testador',
  betaStep2Body: 'Use a mesma conta Google com que entrou no grupo.',
  betaStep2Cta: 'Virar testador',
  betaStep3Title: 'Instale pela Play Store',
  betaStep3Body: 'Aparece como qualquer outro app. As atualizações chegam sozinhas.',
  betaStep3Cta: 'Instalar o LalaTask',
  betaNote: 'O passo 1 vem primeiro — senão o passo 2 diz que o app não está disponível.',
  betaIphone: 'Tem iPhone? Use o LalaTask pelo navegador enquanto a versão iOS não sai.',
  betaFeedback: 'Achou algo confuso ou quebrado? A gente prefere saber:',
  betaBack: 'Voltar para lalatask.com',

  useCasesTitle: 'Onde ele se encaixa',
  useCasesSubtitle: 'Seis jeitos de usar o LalaTask.',
  sectorHouseholdTitle: 'Casa e compras',
  sectorHouseholdBody:
    'Mande a lista de compras como checklist — e veja os itens sendo marcados em tempo real.',
  sectorFamilyTitle: 'Família e cuidados',
  sectorFamilyBody: 'Coordene cuidados com quem você ama, com check-ins confirmados por foto.',
  sectorBusinessTitle: 'Pequenos negócios',
  sectorBusinessBody: 'Passe tarefas para assistente ou prestador — sem onboarding, com controle total.',
  sectorFreelanceTitle: 'Freelance e serviços criativos',
  sectorFreelanceBody: 'Publique seus serviços como ofertas; seu perfil é sua vitrine.',
  sectorTutoringTitle: 'Aulas e reforço',
  sectorTutoringBody: 'Pacotes de aulas com checklists de dever de casa e chat entre uma aula e outra.',
  sectorFitnessTitle: 'Treino e coaching',
  sectorFitnessBody: 'Planos semanais como checklist, pontos pela constância, chat para conferir a execução.',

  ctaTitle: 'Ajude a lançar o LalaTask',
  ctaBody: 'Cada testador conta para sair do beta. Leva um minuto.',
  ctaButton: 'Quero testar',

  footerTagline: 'mande uma tarefa, não uma mensagem',
  footerPrivacy: 'Privacidade',
  footerTerms: 'Termos',
  footerDeleteAccount: 'Excluir conta',
}

export type MessageKey = keyof typeof en

const messages: Record<Locale, Record<MessageKey, string>> = { en, pt }

const LOCALE_KEY = 'godtasker.locale'

export function detectLocale(): Locale {
  const stored = localStorage.getItem(LOCALE_KEY)
  if (stored === 'en' || stored === 'pt') return stored
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

// How long the page fades out before the copy is swapped (see .locale-fade).
const SWITCH_MS = 180

export function useLandingLocale() {
  const [locale, setLocaleState] = useState<Locale>(detectLocale)
  // `switching` is true while the old copy fades out; pages put .locale-fade on
  // their content and toggle .is-switching so the swap reads as a crossfade
  // instead of a flash. Reduced-motion users get an instant swap.
  const [switching, setSwitching] = useState(false)
  const current = useRef(locale)
  useEffect(() => {
    current.current = locale
  }, [locale])
  const timer = useRef<number | null>(null)

  const setLocale = useCallback((l: Locale) => {
    if (l === current.current) return
    localStorage.setItem(LOCALE_KEY, l)
    const instant =
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (instant) {
      setLocaleState(l)
      return
    }
    if (timer.current) window.clearTimeout(timer.current)
    setSwitching(true)
    timer.current = window.setTimeout(() => {
      setLocaleState(l)
      // Next frame, so the new copy mounts before it fades back in.
      window.requestAnimationFrame(() => setSwitching(false))
    }, SWITCH_MS)
  }, [])

  const t = useCallback((key: MessageKey) => messages[locale][key], [locale])
  return { locale, setLocale, t, switching }
}
