import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AnalysisService } from "../src/core/services/analysisService";
import { IAiService } from "../src/core/ports/IAiServivice";
import { CodeAnalysis, AnalysisResult } from "../src/core/domain/analysis";

class MockAiService implements IAiService {
  analyzeCode = jest.fn(async (analysis: CodeAnalysis): Promise<AnalysisResult> => {
    return { result: "Mocked analysis result" };
  });
}

describe('AnalysisService', () => {
  let service: AnalysisService;
  let mockAiService: MockAiService;

  beforeEach(() => {
    mockAiService = new MockAiService();
    service = new AnalysisService(mockAiService);
  });

  it('deberia retornar ek analisis de la ia', async () => {
    const result = await service.analyzeCode({ code: "console.log('test')" });
    expect(result.result).toBe("Mocked analysis result");
  });
});