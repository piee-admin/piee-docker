import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { NavbarLogo } from "@/components/ui/resizable-navbar";

const faqSections = [
  {
    section: "General",
    items: [
      {
        q: "What is PIEE?",
        a: "PIEE is a universal creative command palette for professionals. It helps users streamline their AI workflows, manage creative tools, and generate content in a structured, local, and private way."
      },
      {
        q: "How is PIEE different from other creative tools?",
        a: "PIEE combines local tool execution with model-aware workflows. Instead of isolated generation, you work with a unified interface that respects privacy and provides structure like a developer environment."
      },

      {
        q: "Who is PIEE built for?",
        a: "PIEE is built for solo creators, indie hackers, students, startup teams, and enterprises that rely on AI prompts as part of real workflows."
      }
    ]
  },



  {
    section: "Platform & Ownership",
    items: [
      {
        q: "Is PIEE open-source?",
        a: "No. PIEE is not open-source. The platform and infrastructure are proprietary to ensure security, scalability, and enterprise readiness."
      },
      {
        q: "Why keep the platform proprietary?",
        a: "Prompt infrastructure requires strong guarantees around security, versioning, and access control. A proprietary core allows PIEE to provide these reliably."
      },
      {
        q: "Who owns the prompts I create?",
        a: "You own your prompts. Private prompts remain private unless you explicitly choose to publish or share them."
      }
    ]
  },

  {
    section: "Privacy & Security",
    items: [
      {
        q: "How does PIEE protect private prompts?",
        a: "PIEE uses strong data isolation. Private prompts and workflows are never visible to others unless explicitly shared."
      },
      {
        q: "Can enterprises control access to prompts?",
        a: "Yes. PIEE is designed to support controlled access, allowing teams to define who can view, edit, or reuse prompts."
      },
      {
        q: "Is PIEE suitable for sensitive or internal workflows?",
        a: "Yes. PIEE is designed with enterprise use cases in mind, including internal prompt libraries and restricted workflows."
      }
    ]
  },

  {
    section: "AI Models & Reliability",
    items: [
      {
        q: "Does PIEE support multiple AI models?",
        a: "Yes. PIEE supports prompts designed for different AI models, helping ensure reliability and predictable outputs."
      },
      {
        q: "Why are model-aware prompts important?",
        a: "Different models behave differently. Model-aware prompts reduce failures and make outputs more consistent across teams."
      },
      {
        q: "Can I manage prompts for multiple models at once?",
        a: "Yes. PIEE allows organizing prompts by model, use case, and workflow to support multi-model strategies."
      }
    ]
  },

  {
    section: "Teams & Collaboration",
    items: [
      {
        q: "Does PIEE support team collaboration?",
        a: "Yes. PIEE is built to support shared libraries, reusable workflows, and collaborative prompt development."
      },
      {
        q: "Can teams standardize prompts across projects?",
        a: "Yes. Teams can maintain a single source of truth for prompts, reducing duplication and inconsistencies."
      },
      {
        q: "Is PIEE suitable for agencies or client work?",
        a: "Yes. PIEE can be used to manage prompts across multiple projects while keeping internal and client workflows separate."
      }
    ]
  },

  {
    section: "Enterprise Readiness",
    items: [
      {
        q: "Is PIEE ready for enterprise adoption?",
        a: "PIEE is designed with enterprise needs in mind, including structured workflows, access control, and scalability."
      },
      {
        q: "Can PIEE support large prompt libraries?",
        a: "Yes. PIEE is built to handle large, growing prompt libraries without losing discoverability or structure."
      },
      {
        q: "Does PIEE support internal AI standards?",
        a: "Yes. Organizations can use PIEE to enforce prompt standards, naming conventions, and model usage policies."
      }
    ]
  },

  {
    section: "Vision & Roadmap",
    items: [
      {
        q: "What is PIEE’s long-term vision?",
        a: "PIEE aims to become the infrastructure layer for AI prompts — where ideas are discovered, refined, reused, and scaled across organizations."
      },
      {
        q: "Is PIEE focused on trends or long-term systems?",
        a: "PIEE is focused on long-term systems. It is built for teams that want reliability, structure, and reuse over short-lived prompt trends."
      },
      {
        q: "How will PIEE evolve over time?",
        a: "PIEE will continue expanding its library, collaboration features, and enterprise capabilities based on real-world AI workflows."
      }
    ]
  }
];


const FAQ = () => (
  <section id="faq" className="py-20">
    <div className="container mx-auto px-4 max-w-3xl">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
        Frequently Asked Questions
      </h2>

      {faqSections.map((section, i) => (
        <div key={i} className="mb-12">
          <h3 className="text-2xl font-semibold mb-6">
            {section.section}
          </h3>

          <Accordion type="single" collapsible className="w-full">
            {section.items.map((item, j) => (
              <AccordionItem key={j} value={`item-${i}-${j}`}>
                <AccordionTrigger className="text-left">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  </section>
);

export default function Page() {
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center px-4">
          <NavbarLogo />
        </div>
      </header>
      <main>
        <FAQ />
      </main>
    </>
  );
}
