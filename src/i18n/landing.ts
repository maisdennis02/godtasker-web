import { useCallback, useState } from 'react'

// Minimal i18n for the public landing page. The app itself stays English for
// now; if app-wide i18n lands later, add dictionaries here — the mechanism
// (typed keys + hook) already scales.

export type Locale = 'en' | 'pt'

const en = {
  // nav
  navFeatures: 'Features',
  navUseCases: 'Use cases',
  navLogIn: 'Log in',
  navSignUp: 'Sign up',

  // hero
  heroTitle: 'Create and send simple tasks to your friends, family and co-workers',
  heroSubtitle:
    'Help them bring the answers you need — with due dates, subtask checklists and real-time chat.',
  heroCta: 'Sign up for free',
  heroSecondary: 'See how it works',

  // hero mock task card
  mockTitle: 'Grocery run',
  mockDue: 'Due Sat · 10:00',
  mockYou: 'You',
  mockItem1: 'Oat milk',
  mockItem2: 'Coffee beans',
  mockItem3: 'Bread from the corner bakery',
  mockProgress: '{n} of 3 done',
  mockStatusDoing: 'Bob is on it…',
  mockStatusDone: 'Bob finished — your turn to confirm',
  mockConfirm: 'Confirm',

  // how it works
  navHow: 'How it works',
  howTitle: 'How it works',
  howSubtitle:
    'Not a personal to-do list — every task travels from you to someone else.',
  howStep1Title: 'You create a task',
  howStep1Body: 'Name it, set a due date, break it into subtasks.',
  howStep2Title: 'You send it to someone',
  howStep2Body:
    'Anyone with an email — friend, family, freelancer. It lands on their dashboard, not yours.',
  howStep3Title: 'They deliver, you confirm',
  howStep3Body:
    'They tick off the subtasks; you confirm the result and they earn the points.',

  // features
  featuresTitle: 'Everything a task needs',
  featuresSubtitle: 'No boards, no projects, no setup. A task, a person, a deadline.',
  featDelegateTitle: 'Delegate with clarity',
  featDelegateBody:
    'Send a task to anyone by email — due date, subtask checklist, points and price included.',
  featReceiveTitle: 'Receive and accept',
  featReceiveBody:
    'Tasks arrive with everything spelled out. Accept, update progress step by step, get it done.',
  featOfferTitle: 'Offer your services',
  featOfferBody:
    'Publish offerings with a price and duration — even require a photo to confirm the result.',
  featChatTitle: 'Chat in real time',
  featChatBody: 'Questions and answers along the way. Communication is key.',
  featTrackTitle: 'Keep track by the numbers',
  featTrackBody: 'Your dashboard counts what’s due and overdue, sent and received.',
  featProfileTitle: 'Show off your profile',
  featProfileBody:
    'A public bio with your Instagram and LinkedIn. Get followed, get found, get tasked.',

  // use cases
  useCasesTitle: 'For the bold and organized',
  useCasesSubtitle: 'Six ways people use GodTasker.',
  sectorHouseholdTitle: 'Household & errands',
  sectorHouseholdBody:
    'Send the grocery run as a checklist — and watch items get ticked off in real time.',
  sectorFreelanceTitle: 'Freelance & creative services',
  sectorFreelanceBody: 'Publish your services as offerings; your profile is your storefront.',
  sectorTutoringTitle: 'Tutoring & lessons',
  sectorTutoringBody: 'Lesson packages with homework checklists and chat between classes.',
  sectorBusinessTitle: 'Small-business delegation',
  sectorBusinessBody: 'Task your assistant or contractor by email — no onboarding, full oversight.',
  sectorFamilyTitle: 'Family & caregiving',
  sectorFamilyBody: 'Coordinate care for the people you love, with photo-confirmed check-ins.',
  sectorFitnessTitle: 'Fitness & coaching',
  sectorFitnessBody: 'Weekly plans as checklists, points for consistency, chat for form checks.',

  // CTA band
  ctaTitle: 'See if GodTasker is right for you… it definitely is.',
  ctaButton: 'Get started today!',

  // footer
  footerTagline: 'making you powerful',
}

// Record<keyof typeof en, string> makes tsc reject missing or extra keys.
const pt: Record<keyof typeof en, string> = {
  navFeatures: 'Recursos',
  navUseCases: 'Casos de uso',
  navLogIn: 'Entrar',
  navSignUp: 'Cadastre-se',

  heroTitle: 'Crie e envie tarefas simples para amigos, família e colegas de trabalho',
  heroSubtitle:
    'Ajude-os a trazer as respostas que você precisa — com prazos, checklists de subtarefas e chat em tempo real.',
  heroCta: 'Cadastre-se gratuitamente',
  heroSecondary: 'Veja como funciona',

  mockTitle: 'Compras da semana',
  mockDue: 'Prazo sáb · 10:00',
  mockYou: 'Você',
  mockItem1: 'Leite de aveia',
  mockItem2: 'Café em grãos',
  mockItem3: 'Pão da padaria da esquina',
  mockProgress: '{n} de 3 concluído',
  mockStatusDoing: 'O Bob está cuidando disso…',
  mockStatusDone: 'O Bob terminou — sua vez de confirmar',
  mockConfirm: 'Confirmar',

  navHow: 'Como funciona',
  howTitle: 'Como funciona',
  howSubtitle:
    'Não é uma lista de tarefas pessoal — cada tarefa vai de você para outra pessoa.',
  howStep1Title: 'Você cria a tarefa',
  howStep1Body: 'Dê um nome, defina o prazo e divida em subtarefas.',
  howStep2Title: 'Você envia para alguém',
  howStep2Body:
    'Qualquer pessoa com e-mail — amigo, família, freelancer. A tarefa aparece no painel dela, não no seu.',
  howStep3Title: 'A pessoa entrega, você confirma',
  howStep3Body:
    'Ela marca as subtarefas; você confirma o resultado e ela ganha os pontos.',

  featuresTitle: 'Tudo o que uma tarefa precisa',
  featuresSubtitle: 'Sem quadros, sem projetos, sem configuração. Uma tarefa, uma pessoa, um prazo.',
  featDelegateTitle: 'Delegue com clareza',
  featDelegateBody:
    'Envie uma tarefa para qualquer pessoa por e-mail — com prazo, checklist de subtarefas, pontos e preço.',
  featReceiveTitle: 'Receba e aceite',
  featReceiveBody:
    'As tarefas chegam com tudo definido. Aceite, atualize o progresso passo a passo e conclua.',
  featOfferTitle: 'Ofereça seus serviços',
  featOfferBody:
    'Publique ofertas com preço e duração — e até exija uma foto para confirmar o resultado.',
  featChatTitle: 'Converse em tempo real',
  featChatBody: 'Perguntas e respostas ao longo do caminho. Comunicação é tudo.',
  featTrackTitle: 'Acompanhe pelos números',
  featTrackBody: 'Seu painel mostra o que vence e o que está atrasado, enviado e recebido.',
  featProfileTitle: 'Mostre seu perfil',
  featProfileBody:
    'Uma bio pública com seu Instagram e LinkedIn. Seja seguido, seja encontrado, receba tarefas.',

  useCasesTitle: 'Para os corajosos e organizados',
  useCasesSubtitle: 'Seis formas de usar o GodTasker.',
  sectorHouseholdTitle: 'Casa & tarefas do dia a dia',
  sectorHouseholdBody:
    'Envie as compras como um checklist — e veja os itens sendo marcados em tempo real.',
  sectorFreelanceTitle: 'Freelancers & serviços criativos',
  sectorFreelanceBody: 'Publique seus serviços como ofertas; seu perfil é sua vitrine.',
  sectorTutoringTitle: 'Aulas & tutoria',
  sectorTutoringBody: 'Pacotes de aulas com checklists de lição de casa e chat entre as aulas.',
  sectorBusinessTitle: 'Delegação para pequenos negócios',
  sectorBusinessBody:
    'Envie tarefas ao seu assistente ou prestador por e-mail — sem integração, com controle total.',
  sectorFamilyTitle: 'Família & cuidados',
  sectorFamilyBody: 'Coordene os cuidados de quem você ama, com visitas confirmadas por foto.',
  sectorFitnessTitle: 'Fitness & coaching',
  sectorFitnessBody:
    'Planos semanais em checklist, pontos pela constância e chat para tirar dúvidas.',

  ctaTitle: 'Veja se o GodTasker é para você… com certeza é.',
  ctaButton: 'Comece hoje mesmo!',

  footerTagline: 'te deixando poderoso(a)',
}

export type MessageKey = keyof typeof en

const messages: Record<Locale, Record<MessageKey, string>> = { en, pt }

const LOCALE_KEY = 'godtasker.locale'

export function detectLocale(): Locale {
  const stored = localStorage.getItem(LOCALE_KEY)
  if (stored === 'en' || stored === 'pt') return stored
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

export function useLandingLocale() {
  const [locale, setLocaleState] = useState<Locale>(detectLocale)
  const setLocale = useCallback((l: Locale) => {
    localStorage.setItem(LOCALE_KEY, l)
    setLocaleState(l)
  }, [])
  const t = useCallback((key: MessageKey) => messages[locale][key], [locale])
  return { locale, setLocale, t }
}
