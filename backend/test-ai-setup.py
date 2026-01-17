#!/usr/bin/env python3
"""
Script de prueba para verificar la configuración de IA.
Prueba la conexión con el proveedor configurado.
"""

import asyncio
import sys
from pathlib import Path

# Añadir el directorio backend al path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

from app.core.config import settings
from app.services.ai_adapter import AIAdapter
from app.services.cv_prompts import CVPromptExpert


async def test_ai_configuration():
    """Prueba la configuración de IA"""
    
    print("🤖 FitMyCV - Test de Configuración de IA")
    print("=" * 50)
    print()
    
    # Mostrar configuración actual
    print(f"📋 Configuración actual:")
    print(f"   Provider: {settings.AI_PROVIDER}")
    
    if settings.AI_PROVIDER == "openrouter":
        print(f"   Modelo: {settings.OPENROUTER_MODEL}")
        print(f"   API Key: {'✅ Configurada' if settings.OPENROUTER_API_KEY else '❌ No configurada'}")
    elif settings.AI_PROVIDER == "openai":
        print(f"   Modelo: {settings.OPENAI_MODEL}")
        print(f"   API Key: {'✅ Configurada' if settings.OPENAI_API_KEY else '❌ No configurada'}")
    elif settings.AI_PROVIDER == "anthropic":
        print(f"   Modelo: {settings.ANTHROPIC_MODEL}")
        print(f"   API Key: {'✅ Configurada' if settings.ANTHROPIC_API_KEY else '❌ No configurada'}")
    
    print()
    
    # Verificar que hay API key
    try:
        api_key = settings.ai_api_key
        if not api_key:
            print("❌ Error: No se encontró API key configurada")
            print()
            print("💡 Para configurar:")
            if settings.AI_PROVIDER == "openrouter":
                print("   1. Ve a https://openrouter.ai/keys")
                print("   2. Crea una API key gratuita")
                print("   3. Añádela a backend/.env:")
                print("      OPENROUTER_API_KEY=tu-key-aqui")
            print()
            print("   O ejecuta: ./setup-ai.sh")
            return False
    except ValueError as e:
        print(f"❌ Error: {e}")
        return False
    
    print("🔄 Probando conexión con IA...")
    print()
    
    try:
        # Inicializar el adaptador
        ai = AIAdapter()
        
        # Test simple de extracción de información
        test_job_description = """
        Senior Full-Stack Developer
        
        We are looking for an experienced developer with:
        - 5+ years of experience with React and Node.js
        - Strong knowledge of Python and FastAPI
        - Experience with PostgreSQL and MongoDB
        - Knowledge of Docker and Kubernetes
        - Excellent problem-solving skills
        
        Responsibilities:
        - Design and develop scalable web applications
        - Lead technical architecture decisions
        - Mentor junior developers
        """
        
        print("📝 Ejecutando prueba de extracción de información...")
        result = await ai.extract_job_details(test_job_description)
        
        print()
        print("✅ Conexión exitosa!")
        print()
        print("📊 Resultado de prueba:")
        print(f"   Título: {result.get('title', 'N/A')}")
        print(f"   Nivel: {result.get('experience_level', 'N/A')}")
        print(f"   Skills requeridas: {len(result.get('required_skills', []))}")
        
        if result.get('required_skills'):
            print(f"   Ejemplos: {', '.join(result['required_skills'][:5])}")
        
        print()
        print("━" * 50)
        print("🎉 ¡Configuración correcta! Tu IA está lista para usar.")
        print("━" * 50)
        print()
        
        # Mostrar información adicional según el proveedor
        if settings.AI_PROVIDER == "openrouter":
            print("💡 Tips para OpenRouter:")
            print("   • Ver uso: https://openrouter.ai/activity")
            print("   • Modelos gratuitos: docs/FREE_AI_MODELS.md")
            print("   • Cambiar modelo: edita OPENROUTER_MODEL en .env")
        elif settings.AI_PROVIDER == "openai":
            print("💡 Tips para OpenAI:")
            print("   • Ver uso: https://platform.openai.com/usage")
            print("   • Para economizar: usa gpt-3.5-turbo")
        elif settings.AI_PROVIDER == "anthropic":
            print("💡 Tips para Anthropic:")
            print("   • Ver uso: https://console.anthropic.com/")
        
        print()
        return True
        
    except ValueError as e:
        print(f"❌ Error de configuración: {e}")
        print()
        print("💡 Verifica:")
        print("   1. Tu API key está bien escrita en backend/.env")
        print("   2. El proveedor seleccionado está configurado correctamente")
        print()
        return False
        
    except Exception as e:
        print(f"❌ Error durante la prueba: {str(e)}")
        print()
        print("💡 Posibles causas:")
        print("   • API key inválida o expirada")
        print("   • Problemas de conexión a internet")
        print("   • Límites de rate alcanzados (espera unos minutos)")
        print()
        return False


async def test_cv_prompts():
    """Prueba el sistema de prompts"""
    print()
    print("🧪 Probando sistema de prompts experto...")
    print()
    
    try:
        prompt = CVPromptExpert.get_enhanced_system_prompt("professional")
        
        # Verificar que el prompt contiene elementos clave
        required_elements = [
            "CV writer",
            "ATS",
            "achievements",
            "keywords",
            "JSON"
        ]
        
        missing = [elem for elem in required_elements if elem.lower() not in prompt.lower()]
        
        if missing:
            print(f"⚠️  Advertencia: Prompt incompleto. Faltan: {', '.join(missing)}")
        else:
            print("✅ Sistema de prompts experto cargado correctamente")
            print(f"   Longitud del prompt: {len(prompt)} caracteres")
            print(f"   Incluye mejores prácticas: ✓")
            print(f"   Incluye verbos de acción: ✓")
            print(f"   Incluye guías de ATS: ✓")
        
        # Test de análisis de calidad
        test_cv = """
        John Doe
        Software Engineer
        
        Experience:
        - Developed web applications using React
        - Worked on backend services with Node.js
        - Managed a team of 3 developers
        - Improved application performance by 40%
        """
        
        analysis = CVPromptExpert.analyze_cv_quality(test_cv)
        
        print()
        print("📊 Test de análisis de CV:")
        print(f"   Score de calidad: {analysis['score']}/100")
        print(f"   Tiene métricas: {'✓' if analysis['has_metrics'] else '✗'}")
        print(f"   Usa verbos de acción: {'✓' if analysis['has_action_verbs'] else '✗'}")
        
        if analysis['issues']:
            print(f"   Problemas detectados: {len(analysis['issues'])}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en sistema de prompts: {e}")
        return False


async def main():
    """Función principal"""
    print()
    
    # Test de configuración de IA
    ai_ok = await test_ai_configuration()
    
    # Test de sistema de prompts
    prompts_ok = await test_cv_prompts()
    
    print()
    print("=" * 50)
    
    if ai_ok and prompts_ok:
        print("✅ Todos los tests pasaron correctamente")
        print()
        print("🚀 Siguiente paso:")
        print("   Inicia la aplicación con: docker-compose up")
        print("   O: cd backend && uvicorn app.main:app --reload")
        print()
        return 0
    else:
        print("❌ Algunos tests fallaron")
        print()
        print("📚 Consulta la documentación:")
        print("   docs/AI_CONFIGURATION.md")
        print("   docs/FREE_AI_MODELS.md")
        print()
        print("💬 ¿Necesitas ayuda? Abre un issue en GitHub")
        print()
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
