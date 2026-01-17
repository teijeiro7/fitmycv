#!/bin/bash

# FitMyCV - Script de Configuración Rápida con IA GRATIS
# Este script te ayuda a configurar OpenRouter con modelos gratuitos

set -e

echo "🚀 FitMyCV - Configuración de IA"
echo "================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar si existe el archivo .env
if [ -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Ya existe un archivo backend/.env${NC}"
    read -p "¿Deseas sobrescribirlo? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Configuración cancelada."
        exit 0
    fi
fi

# Copiar el archivo de ejemplo
echo -e "${BLUE}📄 Copiando archivo de configuración...${NC}"
cp backend/.env.example backend/.env

echo ""
echo -e "${GREEN}✅ Archivo .env creado${NC}"
echo ""

# Preguntar por el proveedor de IA
echo "🤖 Selecciona tu proveedor de IA:"
echo ""
echo "1) OpenRouter - GRATIS 🎉 (Recomendado)"
echo "   • Modelos gratuitos de Google, Meta, Microsoft"
echo "   • Sin tarjeta de crédito"
echo "   • Perfecto para desarrollo"
echo ""
echo "2) OpenAI - GPT-4/GPT-3.5 (Requiere pago)"
echo "   • Calidad premium"
echo "   • ~$0.01 por CV con GPT-4"
echo ""
echo "3) Anthropic Claude - (Requiere pago)"
echo "   • Excelente para tareas complejas"
echo "   • ~$0.015 por CV"
echo ""
read -p "Selecciona (1/2/3) [1]: " PROVIDER_CHOICE
PROVIDER_CHOICE=${PROVIDER_CHOICE:-1}

case $PROVIDER_CHOICE in
    1)
        PROVIDER="openrouter"
        echo ""
        echo -e "${BLUE}🔑 Configurando OpenRouter (GRATIS)${NC}"
        echo ""
        echo "Para obtener tu API key GRATUITA:"
        echo "1. Ve a: https://openrouter.ai/keys"
        echo "2. Regístrate con tu email o GitHub"
        echo "3. Crea una nueva API key"
        echo "4. Copia la key (empieza con sk-or-v1-...)"
        echo ""
        
        read -p "Pega tu API key de OpenRouter: " OPENROUTER_KEY
        
        if [ -z "$OPENROUTER_KEY" ]; then
            echo -e "${YELLOW}⚠️  No ingresaste una API key. Puedes configurarla después en backend/.env${NC}"
        else
            # Actualizar el archivo .env
            sed -i.bak "s|AI_PROVIDER=openrouter|AI_PROVIDER=openrouter|g" backend/.env
            sed -i.bak "s|OPENROUTER_API_KEY=your-openrouter-api-key|OPENROUTER_API_KEY=$OPENROUTER_KEY|g" backend/.env
            rm backend/.env.bak 2>/dev/null || true
            
            echo -e "${GREEN}✅ OpenRouter configurado correctamente${NC}"
            echo -e "${GREEN}📱 Modelo: google/gemini-2.0-flash-exp:free${NC}"
        fi
        ;;
    
    2)
        PROVIDER="openai"
        echo ""
        echo -e "${BLUE}🔑 Configurando OpenAI${NC}"
        echo ""
        echo "Para obtener tu API key:"
        echo "1. Ve a: https://platform.openai.com/api-keys"
        echo "2. Crea una nueva API key"
        echo "3. Añade créditos a tu cuenta"
        echo ""
        
        read -p "Pega tu API key de OpenAI: " OPENAI_KEY
        
        if [ -z "$OPENAI_KEY" ]; then
            echo -e "${YELLOW}⚠️  No ingresaste una API key. Puedes configurarla después en backend/.env${NC}"
        else
            sed -i.bak "s|AI_PROVIDER=openrouter|AI_PROVIDER=openai|g" backend/.env
            sed -i.bak "s|OPENAI_API_KEY=your-openai-api-key|OPENAI_API_KEY=$OPENAI_KEY|g" backend/.env
            rm backend/.env.bak 2>/dev/null || true
            
            echo -e "${GREEN}✅ OpenAI configurado correctamente${NC}"
            echo -e "${GREEN}📱 Modelo: gpt-4o${NC}"
        fi
        ;;
    
    3)
        PROVIDER="anthropic"
        echo ""
        echo -e "${BLUE}🔑 Configurando Anthropic Claude${NC}"
        echo ""
        echo "Para obtener tu API key:"
        echo "1. Ve a: https://console.anthropic.com/"
        echo "2. Crea una cuenta"
        echo "3. Genera una API key"
        echo ""
        
        read -p "Pega tu API key de Anthropic: " ANTHROPIC_KEY
        
        if [ -z "$ANTHROPIC_KEY" ]; then
            echo -e "${YELLOW}⚠️  No ingresaste una API key. Puedes configurarla después en backend/.env${NC}"
        else
            sed -i.bak "s|AI_PROVIDER=openrouter|AI_PROVIDER=anthropic|g" backend/.env
            sed -i.bak "s|ANTHROPIC_API_KEY=your-anthropic-api-key|ANTHROPIC_API_KEY=$ANTHROPIC_KEY|g" backend/.env
            rm backend/.env.bak 2>/dev/null || true
            
            echo -e "${GREEN}✅ Anthropic configurado correctamente${NC}"
            echo -e "${GREEN}📱 Modelo: claude-sonnet-4-20250514${NC}"
        fi
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Configuración completada${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Próximos pasos:"
echo ""
echo "1. Revisa y completa la configuración en backend/.env"
echo "2. Configura la base de datos (si aún no lo hiciste)"
echo "3. Inicia la aplicación:"
echo ""
echo "   Con Docker:"
echo "   $ docker-compose up"
echo ""
echo "   Sin Docker:"
echo "   $ cd backend"
echo "   $ source venv/bin/activate"
echo "   $ uvicorn app.main:app --reload"
echo ""
echo "📚 Documentación completa: docs/AI_CONFIGURATION.md"
echo ""
echo -e "${BLUE}🌐 URLs:${NC}"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo "   Docs:     http://localhost:8000/docs"
echo ""

if [ "$PROVIDER" == "openrouter" ]; then
    echo -e "${GREEN}💡 Tip: Puedes ver tu uso de OpenRouter en:${NC}"
    echo "   https://openrouter.ai/activity"
    echo ""
fi

echo "🎉 ¡Listo para empezar!"
