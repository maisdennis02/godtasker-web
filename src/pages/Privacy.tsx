import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import detectiveUrl from '../assets/detective.svg'
import { useLandingLocale } from '../i18n/landing'
import type { Locale } from '../i18n/landing'

// Public privacy policy — required for App Store / Google Play submission and
// Play's Data Safety form. Reuses the landing locale hook so the EN/PT choice
// stays in sync with the marketing site. Content is a self-contained bilingual
// dictionary (kept out of the landing dictionary to avoid bloating it).
//
// ⚠️ Before publishing: confirm CONTACT_EMAIL is a mailbox you monitor (store
// reviewers may write to it) and fill in the controller/company name if you
// operate as a registered entity. This is a plain-language template, not legal
// advice — have it reviewed if you handle EU/BR users at scale.
const CONTACT_EMAIL = 'support@godtasker.app'
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
    title: 'Privacy Policy',
    updated: `Last updated: ${LAST_UPDATED}`,
    intro: [
      'GodTasker ("GodTasker", "we", "us") lets you create tasks and send them to other people, chat about them in real time, publish service offerings, and follow other users. This policy explains what we collect, why, and the choices you have.',
      'By creating an account or using the app or website, you agree to this policy.',
    ],
    sections: [
      {
        h: '1. Information you provide',
        p: [
          'Account: your name, email address, and password (stored only as a salted hash — we never see or store your plain password).',
          'Profile (optional): first and last name, bio, birth date, gender, occupation, Instagram/LinkedIn handles, and a profile photo.',
          'Content you create: tasks (titles, descriptions, subtask checklists, due dates, points/price), service offerings, real-time chat messages, and any photos you upload — including profile pictures and task-confirmation photos.',
        ],
      },
      {
        h: '2. Information created through use',
        p: [
          'Social graph: who you follow, and the users you block or report.',
          'Device push token: if you enable notifications, we store a Firebase Cloud Messaging token so we can send you task and chat alerts. You can turn notifications off at any time in your device settings.',
          'Technical logs: standard server logs (e.g. IP address, timestamps, error diagnostics) needed to operate and secure the service.',
        ],
      },
      {
        h: '3. How we use your information',
        p: [
          'To provide the core service: delivering tasks to the people you send them to, showing conversations, and rendering profiles and offerings.',
          'To send notifications you have enabled about tasks and messages.',
          'To keep the service safe — enforcing blocks, handling reports, and preventing abuse.',
          'We do not sell your personal information, and we do not use it for third-party advertising.',
        ],
      },
      {
        h: '4. Who can see your information',
        p: [
          'Other users: your name, profile details, and profile photo are visible to people you interact with. Tasks, chat messages, and offerings are shared with the specific people they are sent to or published for.',
          'People you block cannot start conversations with you or send you tasks or offering requests, and you cannot reach them either.',
        ],
      },
      {
        h: '5. Service providers',
        p: [
          'We rely on a few processors to run the service, and share only what each needs: Amazon Web Services (S3) stores uploaded images; Google Firebase Cloud Messaging delivers push notifications; Neon and Render host our database and servers. These providers process data on our behalf under their own security and privacy terms.',
        ],
      },
      {
        h: '6. Data retention & deletion',
        p: [
          'We keep your information while your account is active. You can delete your account at any time from Profile → Delete account in the app.',
          'Deleting your account permanently removes your profile, your conversations and chat messages, and your follow connections. Some records may persist briefly in encrypted backups before being overwritten, and we may retain limited information where required by law.',
        ],
      },
      {
        h: '7. Your rights',
        p: [
          'You can access and update your profile in the app, change your password, and delete your account. Depending on where you live (for example the EU/UK under GDPR or Brazil under the LGPD), you may also have rights to request a copy of your data or object to certain processing. To exercise these, contact us at the address below.',
        ],
      },
      {
        h: '8. Children',
        p: [
          'GodTasker is not directed to children under 13, and we do not knowingly collect information from them. If you believe a child has given us personal information, contact us and we will delete it.',
        ],
      },
      {
        h: '9. Security',
        p: [
          'Passwords are hashed, traffic is served over HTTPS, and uploaded files are stored in a private bucket served only through our application. No method of transmission or storage is perfectly secure, but we work to protect your information.',
        ],
      },
      {
        h: '10. Changes',
        p: [
          'We may update this policy as the service evolves. Material changes will be reflected by the "Last updated" date above and, where appropriate, an in-app notice.',
        ],
      },
      {
        h: '11. Contact',
        p: [
          `Questions or requests about your privacy? Email us at ${CONTACT_EMAIL}.`,
        ],
      },
    ],
    back: 'Back to home',
  },
  pt: {
    title: 'Política de Privacidade',
    updated: `Última atualização: ${LAST_UPDATED}`,
    intro: [
      'O GodTasker ("GodTasker", "nós") permite criar tarefas e enviá-las a outras pessoas, conversar em tempo real, publicar ofertas de serviços e seguir outros usuários. Esta política explica o que coletamos, por quê e quais são as suas escolhas.',
      'Ao criar uma conta ou usar o aplicativo ou o site, você concorda com esta política.',
    ],
    sections: [
      {
        h: '1. Informações que você fornece',
        p: [
          'Conta: seu nome, e-mail e senha (armazenada apenas como hash com salt — nunca vemos nem guardamos sua senha em texto).',
          'Perfil (opcional): nome e sobrenome, bio, data de nascimento, gênero, profissão, perfis do Instagram/LinkedIn e uma foto de perfil.',
          'Conteúdo que você cria: tarefas (títulos, descrições, listas de subtarefas, prazos, pontos/preço), ofertas de serviços, mensagens de chat em tempo real e quaisquer fotos que você enviar — incluindo fotos de perfil e fotos de confirmação de tarefas.',
        ],
      },
      {
        h: '2. Informações geradas pelo uso',
        p: [
          'Rede social: quem você segue e os usuários que você bloqueia ou denuncia.',
          'Token de notificação do dispositivo: se você ativar as notificações, guardamos um token do Firebase Cloud Messaging para enviar avisos de tarefas e mensagens. Você pode desativar as notificações a qualquer momento nas configurações do dispositivo.',
          'Registros técnicos: logs de servidor padrão (por exemplo, endereço IP, data/hora, diagnósticos de erro) necessários para operar e proteger o serviço.',
        ],
      },
      {
        h: '3. Como usamos suas informações',
        p: [
          'Para fornecer o serviço: entregar tarefas às pessoas para quem você as envia, exibir conversas e mostrar perfis e ofertas.',
          'Para enviar as notificações que você ativou sobre tarefas e mensagens.',
          'Para manter o serviço seguro — aplicar bloqueios, tratar denúncias e prevenir abusos.',
          'Não vendemos suas informações pessoais e não as usamos para publicidade de terceiros.',
        ],
      },
      {
        h: '4. Quem pode ver suas informações',
        p: [
          'Outros usuários: seu nome, dados de perfil e foto de perfil ficam visíveis para as pessoas com quem você interage. Tarefas, mensagens e ofertas são compartilhadas apenas com as pessoas para quem são enviadas ou publicadas.',
          'Pessoas que você bloqueia não podem iniciar conversas nem enviar tarefas ou pedidos de oferta, e você também não pode contatá-las.',
        ],
      },
      {
        h: '5. Prestadores de serviço',
        p: [
          'Usamos alguns processadores para operar o serviço e compartilhamos apenas o necessário com cada um: a Amazon Web Services (S3) armazena as imagens enviadas; o Google Firebase Cloud Messaging entrega as notificações; a Neon e a Render hospedam nosso banco de dados e servidores. Esses provedores tratam os dados em nosso nome, sob seus próprios termos de segurança e privacidade.',
        ],
      },
      {
        h: '6. Retenção e exclusão de dados',
        p: [
          'Mantemos suas informações enquanto sua conta estiver ativa. Você pode excluir sua conta a qualquer momento em Perfil → Excluir conta no aplicativo.',
          'Excluir sua conta remove permanentemente seu perfil, suas conversas e mensagens e suas conexões de seguidores. Alguns registros podem permanecer brevemente em backups criptografados antes de serem sobrescritos, e podemos reter informações limitadas quando exigido por lei.',
        ],
      },
      {
        h: '7. Seus direitos',
        p: [
          'Você pode acessar e atualizar seu perfil no aplicativo, alterar sua senha e excluir sua conta. Dependendo de onde você mora (por exemplo, a LGPD no Brasil ou o GDPR na UE/Reino Unido), você também pode ter o direito de solicitar uma cópia dos seus dados ou de se opor a certos tratamentos. Para exercê-los, entre em contato pelo endereço abaixo.',
        ],
      },
      {
        h: '8. Crianças',
        p: [
          'O GodTasker não se destina a menores de 13 anos e não coletamos intencionalmente informações deles. Se você acredita que uma criança nos forneceu dados pessoais, entre em contato e os excluiremos.',
        ],
      },
      {
        h: '9. Segurança',
        p: [
          'As senhas são armazenadas como hash, o tráfego usa HTTPS e os arquivos enviados ficam em um bucket privado, servido apenas por meio do nosso aplicativo. Nenhum método de transmissão ou armazenamento é perfeitamente seguro, mas trabalhamos para proteger suas informações.',
        ],
      },
      {
        h: '10. Alterações',
        p: [
          'Podemos atualizar esta política à medida que o serviço evolui. Mudanças relevantes serão refletidas na data de "Última atualização" acima e, quando cabível, em um aviso dentro do aplicativo.',
        ],
      },
      {
        h: '11. Contato',
        p: [
          `Dúvidas ou solicitações sobre sua privacidade? Escreva para ${CONTACT_EMAIL}.`,
        ],
      },
    ],
    back: 'Voltar ao início',
  },
}

export function Privacy() {
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
