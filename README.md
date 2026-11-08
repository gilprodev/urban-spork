# Sem Rodapé — ponte do domínio próprio

Projeto separado do código da revista e do Achadinhos em Alta.

## Objetivo
Manter `https://semrodape.sistemadonas.com.br` abrindo a revista que continua publicada e administrada em `https://revista-sem-rodape.floot.app`, sem trocar os endereços das matérias ou seu sitemap.

## Hospedagem preparada
Cloudflare Pages (plano gratuito). Esta opção é mais apropriada para SEO do que usar um serviço web gratuito do Render que hiberna e pode servir `Disallow: /` para `robots.txt`.

1. Conectar este repositório GitHub no Cloudflare **Workers & Pages > Create > Pages > Connect to Git**.
2. Configurar: produção `main`, comando de build vazio (se exigido, `echo ready`), pasta de publicação `public`.
3. Publicar e testar o domínio temporário `<nome-projeto>.pages.dev` (deve abrir a revista).
4. Na aba **Custom domains** do projeto Pages, adicionar **somente** `semrodape.sistemadonas.com.br`. Não adicionar `sistemadonas.com.br` ou `www.sistemadonas.com.br`.
5. Na Hostinger, alterar exclusivamente os registros DNS com nome `semrodape`: remover os A/AAAA antigos que conflitam e criar um CNAME `semrodape` apontando para o destino exato `<nome-projeto>.pages.dev` que o Cloudflare mostrar. Não tocar em @, www, emails ou outros subdomínios.
6. Confirmar certificado HTTPS ativo e testar o site, uma URL antiga de matéria, `/robots.txt` e `/sitemap.xml`; só depois solicitar nova verificação no Search Console, se necessário.

IMPORTANTE: Nenhum redirecionamento 301 do domínio antigo é feito; o endereço fica igual. Não alterar o sitemap original no Floot.

## Arquivos
- `public/_worker.js`: proxy que encaminha navegação, imagens e /_api para Floot e mantém redirecionamentos internos no domínio público.
- `public/index.html`: reserva técnica, a função intercepta as solicitações reais.

## Limites
O serviço de proxy depende da disponibilidade do Floot. Cookies, login, gravação de rascunhos, transcrição e demais funções privadas devem ser testados antes de administrar a revista pelo domínio próprio. Para acessar o painel editorial de forma confiável durante a transição, use o endereço do Floot. A publicação e configuração DNS ainda exigem ações na Cloudflare e Hostinger.

## Fonte
https://developers.cloudflare.com/pages/configuration/custom-domains/
