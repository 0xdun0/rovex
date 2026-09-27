'use client'; // componente client side interativo

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { useUser } from '@/context/user-context';
import { ImageUploadButton } from '@/components/image-upload-button';
import { User, Mail, Check } from '@/components/icons';

export default function ProfilePage() {
  const { toast } = useToast();
  const { currentLocale } = useLanguage();
  const { user, setUser } = useUser();
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [avatar, setAvatar] = React.useState(user.avatar);
  const [role, setRole] = React.useState(user.role || '');
  const [company, setCompany] = React.useState(user.company || '');
  const [phone, setPhone] = React.useState(user.phone || '');
  const [website, setWebsite] = React.useState(user.website || '');
  const [location, setLocation] = React.useState(user.location || '');

  React.useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setAvatar(user.avatar);
    setRole(user.role || '');
    setCompany(user.company || '');
    setPhone(user.phone || '');
    setWebsite(user.website || '');
    setLocation(user.location || '');
  }, [user]);

  const t = {
    en: {
      title: 'Consultant Profile',
      description: 'Operator identity and credentials stamped across exported technical reports.',
      identitySection: 'Operator Identity',
      contactSection: 'Encrypted Contact Channels',
      orgSection: 'Organization & Node',
      previewSection: 'Deliverable Stamp Preview',
      avatar: 'Profile Avatar',
      upload: 'Change Picture',
      name: 'Full Name',
      role: 'Specialization / Role',
      company: 'Security Consultancy / Team',
      email: 'Operational Email',
      phone: 'Secure Phone Line',
      website: 'Public Key / Domain',
      location: 'Operational Base',
      save: 'Save Changes',
      success: 'Profile parameters updated.',
      fileSelected: 'New picture selected.',
      statusActive: 'VERIFIED OPERATOR',
      systemRole: 'Red Team / Security Assessment',
    },
    'pt-br': {
      title: 'Perfil do Consultor',
      description: 'Identidade e credenciais do operador vinculadas aos relatórios de segurança.',
      identitySection: 'Identidade do Operador',
      contactSection: 'Canais de Contato Seguro',
      orgSection: 'Organização e Unidade',
      previewSection: 'Prévia da Assinatura no Relatório',
      avatar: 'Avatar do Perfil',
      upload: 'Alterar Imagem',
      name: 'Nome Completo',
      role: 'Especialidade / Cargo',
      company: 'Consultoria / Equipe',
      email: 'E-mail Operacional',
      phone: 'Telefone / Canal Seguro',
      website: 'Domínio / Portfólio',
      location: 'Base Operacional',
      save: 'Salvar Alterações',
      success: 'Parâmetros de perfil atualizados com sucesso.',
      fileSelected: 'Nova foto selecionada.',
      statusActive: 'OPERADOR VERIFICADO',
      systemRole: 'Auditoria Ofensiva / Red Team',
    },
    es: {
      title: 'Perfil del Consultor',
      description: 'Identidad y credenciales del operador reflejadas en los informes técnicos.',
      identitySection: 'Identidad del Operador',
      contactSection: 'Canales de Contacto Seguro',
      orgSection: 'Organización y Unidad',
      previewSection: 'Vista Previa de la Firma',
      avatar: 'Avatar del Perfil',
      upload: 'Cambiar Imagen',
      name: 'Nombre Completo',
      role: 'Especialidad / Cargo',
      company: 'Consultoría / Equipo',
      email: 'Correo Operativo',
      phone: 'Teléfono / Canal Seguro',
      website: 'Dominio / Portafolio',
      location: 'Base Operativa',
      save: 'Guardar Cambios',
      success: 'Parámetros de perfil actualizados.',
      fileSelected: 'Nueva imagen seleccionada.',
      statusActive: 'OPERADOR VERIFICADO',
      systemRole: 'Auditoría Ofensiva / Red Team',
    },
  };

  const dict = t[currentLocale] || t.en;

  const handleSave = () => {
    setUser({
      name,
      email,
      avatar,
      role,
      company,
      phone,
      website,
      location,
    });
    toast({ title: dict.success });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-[1400px] mx-auto">
      {/* cabecalho executivo com status e botao de acao rapida */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {dict.title}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/20">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              {dict.statusActive}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{dict.description}</p>
        </div>

        <Button onClick={handleSave} className="h-9 px-4 rounded-xl font-medium gap-2 shadow-xs shrink-0 self-start sm:self-auto">
          <Check className="h-4 w-4" />
          <span>{dict.save}</span>
        </Button>
      </div>

      {/* grid bento com estetica chumbo integrada */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* card lateral: avatar e dados essenciais do operador */}
        <Card className="lg:col-span-4 rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col justify-between">
          <div className="p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <ImageUploadButton
                value={avatar}
                onChange={(dataUrl) => {
                  setAvatar(dataUrl);
                  if (dataUrl) toast({ title: dict.fileSelected });
                }}
                aspect={1}
                cropShape="round"
                previewClassName="h-28 w-28 rounded-2xl border-2 border-border/70 shadow-sm"
                label={dict.upload}
                cropTitle={dict.avatar}
                outputSize={512}
              />
            </div>
            <h2 className="font-semibold text-lg text-foreground mt-2">{name || 'Operator'}</h2>
            <p className="text-xs text-primary font-mono font-medium mt-0.5">{role || dict.systemRole}</p>
            <p className="text-xs text-muted-foreground mt-1">{company || 'Rovex Security Network'}</p>

            <div className="w-full mt-6 pt-5 border-t border-border/50 grid grid-cols-2 gap-3 text-left">
              <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
                <span className="block text-[10px] font-mono text-muted-foreground uppercase">Base</span>
                <span className="text-xs font-semibold truncate block text-foreground mt-0.5">{location || 'Global'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
                <span className="block text-[10px] font-mono text-muted-foreground uppercase">Status</span>
                <span className="text-xs font-semibold text-primary truncate block mt-0.5">Active // 2.4</span>
              </div>
            </div>
          </div>

          {/* preview da assinatura em relatorio impresso/pdf */}
          <div className="p-4 bg-muted/20 border-t border-border/50">
            <span className="text-[10px] font-mono uppercase text-muted-foreground font-semibold block mb-2">
              {dict.previewSection}
            </span>
            <div className="p-3 rounded-lg bg-background/80 border border-border/50 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                {name ? name.charAt(0).toUpperCase() : 'R'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground truncate">{name || 'Operator'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{role || 'Security Consultant'} · {company || 'Rovex'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* painel principal de campos: identidade e conexoes */}
        <div className="lg:col-span-8 space-y-6">
          {/* secao 1: identidade do auditor */}
          <Card className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/40">
              <User className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">{dict.identitySection}</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="prof-name" className="text-xs font-medium text-muted-foreground">{dict.name}</Label>
                <Input
                  id="prof-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 text-xs bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prof-role" className="text-xs font-medium text-muted-foreground">{dict.role}</Label>
                <Input
                  id="prof-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Lead Penetration Tester"
                  className="h-9 text-xs bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prof-company" className="text-xs font-medium text-muted-foreground">{dict.company}</Label>
                <Input
                  id="prof-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="h-9 text-xs bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prof-location" className="text-xs font-medium text-muted-foreground">{dict.location}</Label>
                <Input
                  id="prof-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="São Paulo, BR"
                  className="h-9 text-xs bg-background"
                />
              </div>
            </div>
          </Card>

          {/* secao 2: canais de contato seguro */}
          <Card className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/40">
              <Mail className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">{dict.contactSection}</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="prof-email" className="text-xs font-medium text-muted-foreground">{dict.email}</Label>
                <Input
                  id="prof-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-xs bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prof-phone" className="text-xs font-medium text-muted-foreground">{dict.phone}</Label>
                <Input
                  id="prof-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+55 11 90000-0000"
                  className="h-9 text-xs bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prof-website" className="text-xs font-medium text-muted-foreground">{dict.website}</Label>
                <Input
                  id="prof-website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://sec.domain.io"
                  className="h-9 text-xs bg-background"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
