import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, ShoppingCart, Plus, Scan, BarChart3, Settings } from "lucide-react";

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserGuide = ({ isOpen, onClose }: UserGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Bem-vindo ao Concierge de Compras! 🛒",
      description: "Seu assistente pessoal para organizar compras e gerenciar produtos",
      icon: <ShoppingCart className="w-12 h-12 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Este aplicativo foi criado para facilitar sua vida na hora de fazer compras. 
            Você pode cadastrar produtos, criar listas de compras, e muito mais!
          </p>
          <div className="bg-primary/5 p-4 rounded-lg">
            <h4 className="font-semibold text-primary mb-2">Principais funcionalidades:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Gerenciar catálogo de produtos</li>
              <li>• Criar listas de compras inteligentes</li>
              <li>• Scanner automático de notas fiscais</li>
              <li>• Estatísticas de gastos</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Dashboard - Visão Geral 📊",
      description: "Acompanhe suas estatísticas e atividades recentes",
      icon: <BarChart3 className="w-12 h-12 text-success" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            No Dashboard você encontra um resumo completo das suas atividades:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-success/5 p-3 rounded-lg border border-success/20">
              <h4 className="font-semibold text-success mb-1">📈 Estatísticas</h4>
              <p className="text-sm text-muted-foreground">Total de produtos, gastos mensais e economia</p>
            </div>
            <div className="bg-warning/5 p-3 rounded-lg border border-warning/20">
              <h4 className="font-semibold text-warning mb-1">📋 Listas Ativas</h4>
              <p className="text-sm text-muted-foreground">Suas listas de compras em andamento</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Cadastrar Itens Essenciais 🏷️",
      description: "Adicione os produtos que você consome regularmente",
      icon: <Plus className="w-12 h-12 text-warning" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Use "Cadastrar Itens" para adicionar produtos que aparecem no Dashboard:
          </p>
          <div className="space-y-3">
            <div className="bg-muted/50 p-3 rounded-lg">
              <h4 className="font-semibold mb-2">📦 Seleção Rápida</h4>
              <p className="text-sm text-muted-foreground">
                Escolha entre itens comuns como café, leite, arroz, etc.
              </p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <h4 className="font-semibold mb-2">✏️ Item Personalizado</h4>
              <p className="text-sm text-muted-foreground">
                Adicione itens customizados com nome e duração média
              </p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <h4 className="font-semibold mb-2">📊 Aparecem no Dashboard</h4>
              <p className="text-sm text-muted-foreground">
                Os itens salvos aqui aparecem como Itens Essenciais no Dashboard
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Catálogo de Produtos 🛒",
      description: "Gerencie produtos para adicionar à Lista de Compras",
      icon: <ShoppingCart className="w-12 h-12 text-success" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            O Catálogo permite gerenciar produtos para sua Lista de Compras:
          </p>
          <div className="space-y-3">
            <div className="bg-muted/50 p-3 rounded-lg">
              <h4 className="font-semibold mb-2">➕ Adicionar Produtos</h4>
              <p className="text-sm text-muted-foreground">
                Cadastre produtos com nome, categoria, preço e quantidade
              </p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <h4 className="font-semibold mb-2">🛒 Adicionar à Lista</h4>
              <p className="text-sm text-muted-foreground">
                Clique em "Adicionar à Lista" para enviar produtos para sua Lista de Compras
              </p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <h4 className="font-semibold mb-2">✏️ Editar e Remover</h4>
              <p className="text-sm text-muted-foreground">
                Gerencie seus produtos com os botões de edição e exclusão
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Scanner Inteligente 📱",
      description: "Detecta produtos, quantidades e preços de notas fiscais",
      icon: <Scan className="w-12 h-12 text-urgent" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            O scanner reconhece automaticamente produtos em notas fiscais:
          </p>
          <div className="space-y-3">
            <div className="bg-urgent/5 p-3 rounded-lg border border-urgent/20">
              <h4 className="font-semibold text-urgent mb-2">📸 Câmera</h4>
              <p className="text-sm text-muted-foreground">
                Fotografe notas fiscais - o sistema extrai nome, quantidade e preço
              </p>
            </div>
            <div className="bg-urgent/5 p-3 rounded-lg border border-urgent/20">
              <h4 className="font-semibold text-urgent mb-2">📄 Upload</h4>
              <p className="text-sm text-muted-foreground">
                Envie imagens de cupons fiscais do seu celular
              </p>
            </div>
            <div className="bg-urgent/5 p-3 rounded-lg border border-urgent/20">
              <h4 className="font-semibold text-urgent mb-2">📋 Texto</h4>
              <p className="text-sm text-muted-foreground">
                Cole texto de notas - reconhece até abreviações (ex: "lt" = leite)
              </p>
            </div>
            <div className="bg-urgent/5 p-3 rounded-lg border border-urgent/20">
              <h4 className="font-semibold text-urgent mb-2">✅ Itens vão pro Dashboard</h4>
              <p className="text-sm text-muted-foreground">
                Produtos detectados são salvos automaticamente no Dashboard
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Acessibilidade ♿",
      description: "Recursos para uma experiência mais inclusiva",
      icon: <Settings className="w-12 h-12 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            O aplicativo possui recursos de acessibilidade avançados:
          </p>
          <div className="space-y-3">
            <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
              <h4 className="font-semibold text-primary mb-2">🔤 Tamanho da Fonte</h4>
              <p className="text-sm text-muted-foreground">Ajuste o tamanho do texto para melhor leitura</p>
            </div>
            <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
              <h4 className="font-semibold text-primary mb-2">⚫ Alto Contraste</h4>
              <p className="text-sm text-muted-foreground">Ative para melhor visibilidade</p>
            </div>
            <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
              <h4 className="font-semibold text-primary mb-2">🔊 Leitor de Tela</h4>
              <p className="text-sm text-muted-foreground">Narração automática dos elementos da interface</p>
            </div>
          </div>
          <div className="bg-warning/5 p-3 rounded-lg border border-warning/20">
            <p className="text-sm font-medium text-warning">
              💡 Dica: Acesse o painel de acessibilidade através do botão flutuante no canto inferior direito
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Pronto para começar! 🚀",
      description: "Agora você já conhece todas as funcionalidades",
      icon: <ShoppingCart className="w-12 h-12 text-success" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Parabéns! Você concluiu o tour pelo aplicativo. 
            Agora você está pronto para aproveitar todos os recursos.
          </p>
          <div className="bg-gradient-success p-4 rounded-lg text-success-foreground">
            <h4 className="font-bold mb-2">Resumo do fluxo:</h4>
            <ol className="text-sm space-y-1 text-left">
              <li>1. <strong>Cadastrar Itens</strong> → adiciona ao <strong>Dashboard</strong></li>
              <li>2. <strong>Produtos</strong> → adiciona à <strong>Lista de Compras</strong></li>
              <li>3. Use o <strong>Scanner</strong> para importar de notas fiscais</li>
              <li>4. Configure a <strong>Acessibilidade</strong> conforme preferir</li>
            </ol>
          </div>
          <p className="text-sm text-muted-foreground">
            Você pode acessar este guia novamente através do menu de configurações.
          </p>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute right-0 top-0"
          >
            <X className="w-4 h-4" />
          </Button>
          <DialogTitle className="text-center">Guia do Usuário</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Passo {currentStep + 1} de {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Step Content */}
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center">
                {steps[currentStep].icon}
              </div>
              <div>
                <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
                <CardDescription className="mt-2">{steps[currentStep].description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {steps[currentStep].content}
            </CardContent>
          </Card>
          
          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            
            {currentStep === steps.length - 1 ? (
              <Button onClick={handleClose} className="bg-gradient-success">
                Finalizar
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="flex items-center gap-2 bg-gradient-primary"
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserGuide;