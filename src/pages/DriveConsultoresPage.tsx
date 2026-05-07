import DrivePage from "./DrivePage";

// Reaproveita a mesma página de Drive das outras diretorias, mas
// apontando para a chave "consultores" em diretoria_drive_config.
// Isso garante que o acesso aos arquivos passe pelo OAuth do Google
// do usuário logado (e não por uma API Key pública), respeitando
// as permissões reais da pasta compartilhada com o e-mail dos
// Consultores.
const DriveConsultoresPage = () => (
  // @ts-expect-error - extendendo o union de diretorias para incluir "consultores"
  <DrivePage diretoria="consultores" title="Drive Consultores" />
);

export default DriveConsultoresPage;
