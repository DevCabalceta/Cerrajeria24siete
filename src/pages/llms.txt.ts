import type { APIRoute } from 'astro';
import { business } from '../data/business';
import { faqs } from '../data/faq';
import { serviceCategories, services } from '../data/services';
import { whatsappHref } from '../utils/contact';

/**
 * /llms.txt (https://llmstxt.org): a plain-language summary for AI assistants
 * and answer engines (GEO). Built from the same verified data as the page, so
 * it can never say more than the site does.
 */
export const GET: APIRoute = ({ site }) => {
  const home = new URL('/', site).href;
  const section = (hash: string) => new URL(`/#${hash}`, site).href;

  const servicesByCategory = serviceCategories
    .map((category) => {
      const items = services
        .filter((service) => service.category === category.id)
        .map((service) => `- ${service.title}: ${service.summary}`);
      return `### ${category.label}\n\n${items.join('\n')}`;
    })
    .join('\n\n');

  const body = `# ${business.name}

> ${business.tagline}. Cerrajería en general y portones eléctricos a domicilio en ${business.country}, ${business.availability.long}. ${business.experience}. Zonas: ${business.coverage.areas.join(', ')}; ${business.coverage.summary}.

## Contacto

- Teléfono: ${business.phone.display} (${business.phone.e164})
- WhatsApp: ${business.phone.display} — ${whatsappHref()}
- Correo: ${business.email}
- Sitio: ${home}

## Horario

- ${business.availability.long}, incluidos noches, fines de semana y feriados. Atención de emergencias.

## Cobertura

- Zonas principales: ${business.coverage.areas.join(', ')}.
- Además: ${business.coverage.summary}, en perímetro urbano y rural. Servicio a domicilio.
- Detalle: ${section('cobertura')}

## Servicios

${servicesByCategory}

## Empresa

- ${business.experience}.
${business.claims.map((claim) => `- ${claim}.`).join('\n')}

## Preguntas frecuentes

${faqs.map((faq) => `### ${faq.question}\n\n${faq.answer}`).join('\n\n')}

## Páginas

- [Inicio](${home}): presentación, servicios, emergencias, cobertura, galería de trabajos y contacto.
- [Servicios](${section('servicios')})
- [Emergencias 24/7](${section('emergencias')})
- [Preguntas frecuentes](${section('preguntas')})
- [Contacto](${section('contacto')})
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
