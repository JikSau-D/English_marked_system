#!/usr/bin/env python3
"""
测试百度OCR和DeepSeek API连接性的脚本
"""

import asyncio
import os
from pathlib import Path

# 添加项目路径以便导入
import sys
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from app.core.config import settings
from app.services.ocr_service import _get_baidu_access_token
from app.services.ai_evaluation_service import _call_deepseek
import httpx


async def test_baidu_ocr_connection():
    """测试百度OCR连接"""
    print("=" * 50)
    print("正在测试百度OCR连接...")
    
    if not settings.BAIDU_OCR_API_KEY or not settings.BAIDU_OCR_SECRET_KEY:
        print("❌ 错误: 百度OCR API密钥未配置")
        print(f"   BAIDU_OCR_API_KEY: {'已配置' if settings.BAIDU_OCR_API_KEY else '未配置'}")
        print(f"   BAIDU_OCR_SECRET_KEY: {'已配置' if settings.BAIDU_OCR_SECRET_KEY else '未配置'}")
        return False
    
    try:
        async with httpx.AsyncClient() as client:
            token = await _get_baidu_access_token(client)
            print(f"✅ 百度OCR连接成功！获取到访问令牌: {token[:20]}...")
            return True
    except Exception as e:
        print(f"❌ 百度OCR连接失败: {str(e)}")
        return False


async def test_deepseek_connection():
    """测试DeepSeek连接"""
    print("=" * 50)
    print("正在测试DeepSeek连接...")
    
    if not settings.DEEPSEEK_API_KEY:
        print("❌ 错误: DeepSeek API密钥未配置")
        print(f"   DEEPSEEK_API_KEY: {'已配置' if settings.DEEPSEEK_API_KEY else '未配置'}")
        return False
    
    try:
        # 发送一个简单的测试请求
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Hello, are you available?"}
        ]
        
        response = await _call_deepseek(messages)
        print(f"✅ DeepSeek连接成功！收到响应: {response[:50]}...")
        return True
    except Exception as e:
        print(f"❌ DeepSeek连接失败: {str(e)}")
        return False


async def main():
    print("🔍 开始测试API连接...")
    print(f"🔧 配置文件加载自: {settings.model_config['env_file']}")
    
    # 测试百度OCR
    ocr_success = await test_baidu_ocr_connection()
    
    # 测试DeepSeek
    deepseek_success = await test_deepseek_connection()
    
    print("=" * 50)
    print("📊 测试结果汇总:")
    print(f"百度OCR: {'✅ 成功' if ocr_success else '❌ 失败'}")
    print(f"DeepSeek: {'✅ 成功' if deepseek_success else '❌ 失败'}")
    
    if ocr_success and deepseek_success:
        print("\n🎉 所有API连接测试通过！")
        print("您的系统现在应该能够正常使用评估功能。")
    else:
        print("\n⚠️  部分API连接测试失败，请检查配置。")
        print("请确认API密钥是否正确、有效，并且服务提供商允许访问。")


if __name__ == "__main__":
    asyncio.run(main())