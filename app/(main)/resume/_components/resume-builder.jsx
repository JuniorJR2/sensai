'use client';

import { saveResume } from '@/actions/resume';
import { resumeSchema } from '@/app/lib/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import useFetch from '@/hooks/use-fetch';
import { useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertTriangle,
  Download,
  Edit,
  Loader2,
  Monitor,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import MDEditor from '@uiw/react-md-editor';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { entriesToMarkdown } from '@/app/lib/helper';
import { EntryForm } from './entry-form';
//import html2pdf from 'html2pdf.js/dist/html2pdf.min.js';

const ResumeBuilder = ({ initialContent }) => {
  const [activeTab, setActiveTab] = useState('edit');
  const [previewContent, setPreviewContent] = useState(initialContent);
  const { user } = useUser();
  const [resumeMode, setResumeMode] = useState('preview');

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
      summary: '',
      skills: '',
      experience: [],
      education: [],
      projects: [],
    },
  });

  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  const formValues = watch();

  useEffect(() => {
    if (initialContent) setActiveTab('preview');
  }, [initialContent]);

  // Update preview content when form values change
  useEffect(() => {
    if (activeTab === 'edit') {
      const newContent = getCombinedContent();
      setPreviewContent(newContent ? newContent : initialContent);
    }
  }, [formValues, activeTab]);

  const getContactMarkdown = () => {
    const { contactInfo } = formValues;
    const parts = [];
    if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`);
    if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`);
    if (contactInfo.linkedin)
      parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
    if (contactInfo.twitter) parts.push(`🐦 [Twitter](${contactInfo.twitter})`);

    return parts.length > 0
      ? `## <div align="center">${user.fullName}</div>
        \n\n<div align="center">\n\n${parts.join(' | ')}\n\n</div>`
      : '';
  };

  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValues;
    return [
      getContactMarkdown(),
      summary && `## Resumen Profesional\n\n${summary}`,
      skills && `## Habilidades\n\n${skills}`,
      entriesToMarkdown(experience, 'Work Experience'),
      entriesToMarkdown(education, 'Education'),
      entriesToMarkdown(projects, 'Projects'),
    ]
      .filter(Boolean)
      .join('\n\n');
  };

  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    if (typeof window === 'undefined') {
      console.error('PDF generation can only run on the client side.');
      return;
    }

    setIsGenerating(true);
    toast.loading('Preparando PDF...');

    // --- INICIO DEL APAGÓN DE ESTILOS ---
    const stylesheets = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]')
    );
    stylesheets.forEach((sheet) => {
      sheet.disabled = true;
    });
    // --- FIN DEL APAGÓN ---

    try {
      // 1. Importacion de las librerías necesarias
      const html2pdf = (await import('html2pdf.js/dist/html2pdf.min.js'))
        .default;
      const { marked } = await import('marked');

      // --- DEPURACIÓN: ---
      console.log('1. previewContent (Markdown Crudo):', previewContent);
      // --- FIN DE LA DEPURACIÓN ---

      // 2. Convercion del el Markdown a HTML simple
      const htmlContent = marked(previewContent);

      // --- DEPURACIÓN: ---
      console.log('2. htmlContent (HTML Convertido):', htmlContent);
      // --- FIN DE LA DEPURACIÓN ---

      // 3.  ELEMENTO DIV DESCONECTADO
      const pdfElement = document.createElement('div');

      // 4. Aplicacion de estilos DIRECTAMENTE.
      pdfElement.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      pdfElement.style.fontSize = '12px';
      pdfElement.style.lineHeight = '1.6';
      pdfElement.style.color = '#000000';
      pdfElement.style.backgroundColor = '#ffffff';
      pdfElement.style.padding = '40px';
      pdfElement.style.width = '210mm';

      // 5. inyeccion de HTML limpio
      pdfElement.innerHTML = htmlContent;

      // --- DEPURACIÓN:  ---
      console.log(
        '3. pdfElement.innerHTML (Contenido final del div):',
        pdfElement.innerHTML
      );
      // --- FIN DE LA DEPURACIÓN ---

      // 6. Configuracion y generacion de el PDF
      const opt = {
        margin: [10, 10, 10, 10],
        filename: 'resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      toast.dismiss();
      toast.loading('Generando PDF...');

      await html2pdf().set(opt).from(pdfElement).save();

      toast.dismiss();
      toast.success('¡PDF descargado con éxito!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.dismiss();
      toast.error('Error al generar el PDF. Revisa la consola.');
    } finally {
      // --- INICIO DE LA RESTAURACIÓN ---
      stylesheets.forEach((sheet) => {
        sheet.disabled = false;
      });
      // --- FIN DE LA RESTAURACIÓN ---

      setIsGenerating(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formattedContent = previewContent
        .replace(/\n/g, '\n') // Normalize newlines
        .replace(/\n\s*\n/g, '\n\n') // Normalize multiple newlines to double newlines
        .trim();

      console.log(previewContent, formattedContent);
      await saveResumeFn(previewContent);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <h1 className="font-bold gradient-title text-5xl md:text-6xl">
          Creador de Currículum
        </h1>
        <div className="space-x-2">
          <Button
            variant="destructive"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar
              </>
            )}
          </Button>
          <Button onClick={generatePDF} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Descargar PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">Formulario</TabsTrigger>
          <TabsTrigger value="preview">Markdown</TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información de Contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Correo Electrónico
                  </label>
                  <Input
                    {...register('contactInfo.email')}
                    type="email"
                    placeholder="tu@email.com"
                    error={errors.contactInfo?.email}
                  />
                  {errors.contactInfo?.email && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Número de Teléfono
                  </label>
                  <Input
                    {...register('contactInfo.mobile')}
                    type="tel"
                    placeholder="+1 234 567 8900"
                  />
                  {errors.contactInfo?.mobile && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.mobile.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">URL de LinkedIn</label>
                  <Input
                    {...register('contactInfo.linkedin')}
                    type="url"
                    placeholder="https://linkedin.com/in/tu-perfil"
                  />
                  {errors.contactInfo?.linkedin && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.linkedin.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Perfil de Twitter/X
                  </label>
                  <Input
                    {...register('contactInfo.twitter')}
                    type="url"
                    placeholder="https://twitter.com/tu-usuario"
                  />
                  {errors.contactInfo?.twitter && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.twitter.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Resumen Profesional</h3>
              <Controller
                name="summary"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="escribe un resumen profesional convincente..."
                    error={errors.summary}
                  />
                )}
              />
              {errors.summary && (
                <p className="text-sm text-red-500">{errors.summary.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Habilidades</h3>
              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="enumera tus habilidades clave"
                    error={errors.skills}
                  />
                )}
              />
              {errors.skills && (
                <p className="text-sm text-red-500">{errors.skills.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Experiencia Laboral</h3>
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Experience"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.experience && (
                <p className="text-sm text-red-500">
                  {errors.experience.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Educación</h3>
              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Education"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.education && (
                <p className="text-sm text-red-500">
                  {errors.education.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Proyectos</h3>
              <Controller
                name="projects"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Projects"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.projects && (
                <p className="text-sm text-red-500">
                  {errors.projects.message}
                </p>
              )}
            </div>
          </form>
        </TabsContent>
        <TabsContent value="preview">
          {activeTab === 'preview' && (
            <Button
              variant="link"
              type="button"
              className="mb-2"
              onClick={() =>
                setResumeMode(resumeMode === 'preview' ? 'edit' : 'preview')
              }
            >
              {resumeMode === 'preview' ? (
                <>
                  <Edit className="h-4 w-4" />
                  Editar Currículum
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4" />
                  Mostrar Vista Previa
                </>
              )}
            </Button>
          )}

          {activeTab === 'preview' && resumeMode !== 'preview' && (
            <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">
                Perderás el markdown editado si actualizas los datos del
                formulario.
              </span>
            </div>
          )}
          <div className="border rounded-lg">
            <MDEditor
              data-color-mode="light"
              value={previewContent}
              onChange={setPreviewContent}
              height={800}
              preview={resumeMode}
            />
          </div>

          {/* Este div ahora es solo un ancla. No necesitamos nada dentro. */}
          <div id="pdf-anchor" className="hidden"></div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResumeBuilder;
