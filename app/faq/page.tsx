import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Header } from "../page";

const faqSections = [
  {
    section: "General",
    items: [
      {
        q: "What is PIEE?",
        a: "PIEE (Prompt Infrastructure for Enterprise & Experts) is an offline-first creative command palette and universal file engine."
      },
      {
        q: "Is PIEE open-source?",
        a: "Yes, PIEE is 100% open-source under the MIT License."
      },
      {
        q: "Does PIEE need internet?",
        a: "No. Most tools run offline. Cloud features require internet."
      }
    ]
  },

  {
    section: "Privacy & Security",
    items: [
      {
        q: "Does PIEE upload my files to a server?",
        a: "No. All core processing happens locally using WebAssembly."
      },
      {
        q: "How are my API keys stored?",
        a: "Encrypted locally or in your encrypted cloud workspace."
      },
      {
        q: "Is PIEE safe for enterprise?",
        a: "Yes. Includes RBAC, versioning, audit logs, and self-hosting options."
      }
    ]
  },

  {
    section: "Features",
    subsections: [
      {
        title: "File Tools",
        items: [
          {
            q: "What file types are supported?",
            a: "Video, images, documents, audio, and data formats. More added regularly."
          },
          {
            q: "Does PIEE replace Photoshop or Resolve?",
            a: "No. PIEE speeds up everyday tasks like convert, compress, optimize, rename, automate."
          }
        ]
      },
      {
        title: "Command Palette",
        items: [
          {
            q: "What is the creative command palette?",
            a: "A single shortcut (⌘+Space / Ctrl+Space) that lets you process files instantly."
          },
          {
            q: "Can I drop any file into the palette?",
            a: "Yes. PIEE detects the file type automatically and shows available actions."
          }
        ]
      },
      {
        title: "AI & Automation",
        items: [
          {
            q: "Which AI models are supported?",
            a: "OpenAI, Anthropic, Gemini, Groq, and local models like Ollama."
          },
          {
            q: "Can PIEE automate repetitive tasks?",
            a: "Yes. Workflows let you chain actions (convert → compress → upload) automatically."
          }
        ]
      }
    ]
  },

  {
    section: "Team & Collaboration",
    items: [
      {
        q: "Does PIEE support team workspaces?",
        a: "Yes. Teams can share files, presets, workflows, and permissions."
      },
      {
        q: "Can I use PIEE for client projects?",
        a: "Yes. It’s free for commercial use under MIT."
      }
    ]
  },

  {
    section: "Credits & Billing",
    items: [
      {
        q: "What uses credits?",
        a: "Cloud AI generation (text, image, audio, video). Local tools are free."
      },
      {
        q: "Can I use my own API key?",
        a: "Yes. If you connect your own key, your usage is billed directly to your provider."
      },
      {
        q: "What happens if credits run out?",
        a: "Local tasks continue. Cloud generation pauses until you top up."
      }
    ]
  },

  {
    section: "Developer & Plugins",
    items: [
      {
        q: "Can developers build plugins?",
        a: "Yes. PIEE exposes a Plugin API for creating custom tools and integrations."
      },
      {
        q: "Is there a public roadmap?",
        a: "Yes. Available on GitHub, where you can vote on upcoming features."
      },
      {
        q: "Can PIEE be self-hosted?",
        a: "Yes. Deploy with Docker, Coolify, or Kubernetes."
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
          {/* Section Title */}
          <h3 className="text-2xl font-semibold mb-6">{section.section}</h3>

          {/* If section has subsections */}
          {section.subsections ? (
            section.subsections.map((sub, sIdx) => (
              <div key={sIdx} className="mb-8">
                <h4 className="text-xl font-medium mb-4">{sub.title}</h4>
                <Accordion type="single" collapsible className="w-full">
                  {sub.items.map((item, j) => (
                    <AccordionItem key={j} value={`sub-${i}-${sIdx}-${j}`}>
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
            ))
          ) : (
            // Regular section (no subsections)
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
          )}
        </div>
      ))}
    </div>
  </section>
);

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <FAQ />
      </main>
    </>
  );
}