import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import detectiveUrl from '../assets/detective.svg'
import { useLandingLocale } from '../i18n/landing'
import type { Locale } from '../i18n/landing'

// Public Terms of Service — companion to the privacy policy, linked from stores
// and the landing footer. Same bilingual, self-contained structure as Privacy.tsx.
//
// ⚠️ Before publishing: set CONTACT_EMAIL to a monitored mailbox and GOVERNING_LAW
// to the jurisdiction you operate under (or have counsel choose). Plain-language
// template, not legal advice.
const CONTACT_EMAIL = 'support@godtasker.app'
// e.g. 'the State of São Paulo, Brazil' or 'the State of Delaware, USA'
const GOVERNING_LAW = '[your jurisdiction]'
const LAST_UPDATED = '2026-07-11'

type Section = { h: string; p: string[] }
type Copy = {
  title: string
  updated: string
  intro: string[]
  sections: Section[]
  back: string
}

const CONTENT: Record<Locale, Copy> = {
  en: {
    title: 'Terms of Service',
    updated: `Last updated: ${LAST_UPDATED}`,
    intro: [
      'These Terms of Service ("Terms") govern your use of GodTasker — the app and website that let you create tasks and send them to other people, chat about them, publish service offerings, and follow other users ("the Service").',
      'By creating an account or using the Service, you agree to these Terms and to our Privacy Policy. If you do not agree, do not use the Service.',
    ],
    sections: [
      {
        h: '1. Eligibility',
        p: [
          'You must be at least 13 years old to use GodTasker. If you use the Service on behalf of an organization, you represent that you are authorized to accept these Terms for it.',
        ],
      },
      {
        h: '2. Your account',
        p: [
          'You are responsible for the accuracy of the information you provide and for keeping your password confidential. You are responsible for all activity under your account.',
          'Notify us promptly if you believe your account has been accessed without authorization.',
        ],
      },
      {
        h: '3. How GodTasker works',
        p: [
          'GodTasker is a platform for delegating tasks between people. You can create a task and send it to someone, receive tasks others send you, publish offerings describing services you provide, chat in real time, and follow other users.',
          'GodTasker only provides the platform. We are not a party to, and do not supervise, guarantee, or take responsibility for, the tasks users agree to, perform, or complete through the Service.',
        ],
      },
      {
        h: '4. Payments are between users',
        p: [
          'GodTasker does not process payments. Any price shown on a task or offering is informational only. If a task or offering involves payment or other consideration, that arrangement is made and settled directly between the users involved — GodTasker is not a party to it and is not responsible for it.',
          'Points and scores in the app are a non-monetary feature with no cash value.',
        ],
      },
      {
        h: '5. Your content',
        p: [
          'You keep ownership of the content you create — tasks, messages, offerings, photos, and profile information. You are responsible for the content you post and for having the rights to share it.',
          'You grant GodTasker a limited, worldwide, non-exclusive license to host, store, and display your content solely to operate and provide the Service (for example, delivering a task to its recipient or showing your profile photo to people you interact with). This license ends when you delete the content or your account, except for content already shared with others or retained as required by law.',
        ],
      },
      {
        h: '6. Acceptable use',
        p: [
          'You agree not to use the Service to: break the law or facilitate illegal activity; harass, threaten, or abuse others; impersonate anyone; post content that is defamatory, obscene, or infringes someone else’s rights; send spam or unsolicited solicitations; upload malware; or scrape, overload, or attempt to gain unauthorized access to the Service or its data.',
          'You may block and report other users. We may review reports and take action — including removing content or suspending accounts — but we are not obligated to monitor all activity.',
        ],
      },
      {
        h: '7. Termination',
        p: [
          'You can stop using the Service and delete your account at any time from Profile → Delete account.',
          'We may suspend or terminate your access if you violate these Terms or use the Service in a way that harms other users, GodTasker, or third parties.',
        ],
      },
      {
        h: '8. Disclaimers',
        p: [
          'The Service is provided "as is" and "as available", without warranties of any kind, whether express or implied. We do not warrant that the Service will be uninterrupted, error-free, or secure, or that tasks arranged through it will be completed satisfactorily.',
          'GodTasker is not responsible for the conduct of any user or for the quality, safety, legality, or outcome of any task, offering, or interaction between users.',
        ],
      },
      {
        h: '9. Limitation of liability',
        p: [
          'To the maximum extent permitted by law, GodTasker and its operators will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of data, profits, or goodwill, arising from your use of the Service or from interactions between users. Nothing in these Terms limits liability that cannot be limited under applicable law.',
        ],
      },
      {
        h: '10. Changes to these Terms',
        p: [
          'We may update these Terms as the Service evolves. Material changes will be reflected by the "Last updated" date above and, where appropriate, an in-app notice. Continuing to use the Service after changes take effect means you accept the updated Terms.',
        ],
      },
      {
        h: '11. Governing law',
        p: [
          `These Terms are governed by the laws of ${GOVERNING_LAW}, without regard to its conflict-of-laws rules, except where mandatory consumer-protection law in your country of residence applies.`,
        ],
      },
      {
        h: '12. Contact',
        p: [`Questions about these Terms? Email us at ${CONTACT_EMAIL}.`],
      },
    ],
    back: 'Back to home',
  },
  pt: {
    title: 'Termos de Serviço',
    updated: `Última atualização: ${LAST_UPDATED}`,
    intro: [
      'Estes Termos de Serviço ("Termos") regem o uso do GodTasker — o aplicativo e o site que permitem criar tarefas e enviá-las a outras pessoas, conversar sobre elas, publicar ofertas de serviços e seguir outros usuários ("o Serviço").',
      'Ao criar uma conta ou usar o Serviço, você concorda com estes Termos e com nossa Política de Privacidade. Se não concordar, não use o Serviço.',
    ],
    sections: [
      {
        h: '1. Elegibilidade',
        p: [
          'Você deve ter pelo menos 13 anos para usar o GodTasker. Se usar o Serviço em nome de uma organização, você declara estar autorizado a aceitar estes Termos em nome dela.',
        ],
      },
      {
        h: '2. Sua conta',
        p: [
          'Você é responsável pela veracidade das informações que fornece e por manter sua senha em sigilo. Você é responsável por toda atividade realizada em sua conta.',
          'Avise-nos imediatamente se achar que sua conta foi acessada sem autorização.',
        ],
      },
      {
        h: '3. Como o GodTasker funciona',
        p: [
          'O GodTasker é uma plataforma para delegar tarefas entre pessoas. Você pode criar uma tarefa e enviá-la a alguém, receber tarefas que outros lhe enviam, publicar ofertas descrevendo serviços que presta, conversar em tempo real e seguir outros usuários.',
          'O GodTasker apenas fornece a plataforma. Não somos parte, nem supervisionamos, garantimos ou nos responsabilizamos pelas tarefas que os usuários combinam, executam ou concluem por meio do Serviço.',
        ],
      },
      {
        h: '4. Pagamentos são entre usuários',
        p: [
          'O GodTasker não processa pagamentos. Qualquer preço exibido em uma tarefa ou oferta é apenas informativo. Se uma tarefa ou oferta envolver pagamento ou outra contraprestação, esse acordo é feito e liquidado diretamente entre os usuários envolvidos — o GodTasker não é parte dele e não se responsabiliza por ele.',
          'Pontos e pontuações no aplicativo são um recurso não monetário, sem valor em dinheiro.',
        ],
      },
      {
        h: '5. Seu conteúdo',
        p: [
          'Você mantém a titularidade do conteúdo que cria — tarefas, mensagens, ofertas, fotos e informações de perfil. Você é responsável pelo conteúdo que publica e por ter os direitos para compartilhá-lo.',
          'Você concede ao GodTasker uma licença limitada, mundial e não exclusiva para hospedar, armazenar e exibir seu conteúdo exclusivamente para operar e fornecer o Serviço (por exemplo, entregar uma tarefa ao destinatário ou mostrar sua foto de perfil às pessoas com quem você interage). Essa licença termina quando você exclui o conteúdo ou sua conta, exceto quanto ao conteúdo já compartilhado com terceiros ou retido conforme exigido por lei.',
        ],
      },
      {
        h: '6. Uso aceitável',
        p: [
          'Você concorda em não usar o Serviço para: violar a lei ou facilitar atividade ilegal; assediar, ameaçar ou abusar de terceiros; se passar por outra pessoa; publicar conteúdo difamatório, obsceno ou que viole direitos de terceiros; enviar spam ou solicitações não autorizadas; enviar malware; ou coletar dados de forma automatizada, sobrecarregar ou tentar obter acesso não autorizado ao Serviço ou aos seus dados.',
          'Você pode bloquear e denunciar outros usuários. Podemos analisar denúncias e tomar providências — incluindo remover conteúdo ou suspender contas — mas não temos obrigação de monitorar toda a atividade.',
        ],
      },
      {
        h: '7. Encerramento',
        p: [
          'Você pode parar de usar o Serviço e excluir sua conta a qualquer momento em Perfil → Excluir conta.',
          'Podemos suspender ou encerrar seu acesso se você violar estes Termos ou usar o Serviço de forma que prejudique outros usuários, o GodTasker ou terceiros.',
        ],
      },
      {
        h: '8. Isenções de garantia',
        p: [
          'O Serviço é fornecido "no estado em que se encontra" e "conforme disponível", sem garantias de qualquer tipo, expressas ou implícitas. Não garantimos que o Serviço será ininterrupto, livre de erros ou seguro, nem que as tarefas combinadas por meio dele serão concluídas de forma satisfatória.',
          'O GodTasker não se responsabiliza pela conduta de qualquer usuário nem pela qualidade, segurança, legalidade ou resultado de qualquer tarefa, oferta ou interação entre usuários.',
        ],
      },
      {
        h: '9. Limitação de responsabilidade',
        p: [
          'Na máxima extensão permitida por lei, o GodTasker e seus operadores não se responsabilizam por danos indiretos, incidentais, especiais, consequenciais ou punitivos, nem por perda de dados, lucros ou reputação, decorrentes do uso do Serviço ou de interações entre usuários. Nada nestes Termos limita responsabilidades que não possam ser limitadas segundo a lei aplicável.',
        ],
      },
      {
        h: '10. Alterações destes Termos',
        p: [
          'Podemos atualizar estes Termos à medida que o Serviço evolui. Mudanças relevantes serão refletidas na data de "Última atualização" acima e, quando cabível, em um aviso dentro do aplicativo. Continuar usando o Serviço após a entrada em vigor das mudanças significa que você aceita os Termos atualizados.',
        ],
      },
      {
        h: '11. Lei aplicável',
        p: [
          `Estes Termos são regidos pelas leis de ${GOVERNING_LAW}, sem prejuízo das normas de proteção ao consumidor obrigatórias do seu país de residência.`,
        ],
      },
      {
        h: '12. Contato',
        p: [`Dúvidas sobre estes Termos? Escreva para ${CONTACT_EMAIL}.`],
      },
    ],
    back: 'Voltar ao início',
  },
}

export function Terms() {
  const { locale, setLocale } = useLandingLocale()
  const c = CONTENT[locale]

  useEffect(() => {
    const prevTitle = document.title
    const prevLang = document.documentElement.lang
    document.title = `${c.title} · GodTasker`
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en'
    return () => {
      document.title = prevTitle
      document.documentElement.lang = prevLang
    }
  }, [c.title, locale])

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200">
      <header className="sticky top-0 z-20 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={detectiveUrl} alt="" className="h-7 w-7" />
            <span className="text-lg font-bold tracking-tight text-white">GodTasker</span>
          </Link>
          <div className="flex overflow-hidden rounded-full border border-slate-700 text-xs font-semibold">
            {(['en', 'pt'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                className={`px-2.5 py-1 transition ${
                  locale === l ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {l === 'en' ? 'EN' : 'PT'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">{c.title}</h1>
        <p className="mt-2 text-sm text-slate-500">{c.updated}</p>

        <div className="mt-6 space-y-4">
          {c.intro.map((p, i) => (
            <p key={i} className="leading-relaxed text-slate-300">
              {p}
            </p>
          ))}
        </div>

        <div className="mt-10 space-y-8">
          {c.sections.map(s => (
            <section key={s.h}>
              <h2 className="text-lg font-semibold text-white">{s.h}</h2>
              <div className="mt-2 space-y-2">
                {s.p.map((p, i) => (
                  <p key={i} className="leading-relaxed text-slate-300">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 border-t border-slate-800/60 pt-6">
          <Link to="/" className="text-sm text-indigo-400 hover:text-indigo-300">
            ← {c.back}
          </Link>
        </div>
      </main>
    </div>
  )
}
