export interface PatientReport {
    patient_id: string;
    risk_assessment: {
        summary: string;
        overall_risk_score: number;
        high_risk_variants_count: number;
    };
    pharmacogenomic_profile: any[];
    clinical_recommendation: {
        drug: string;
        action: string;
        reason: string;
        alternative?: string;
        evidence_level?: string;
    }[];
    llm_generated_explanation: {
        biological_explanation: string;
        clinical_interpretation: string;
        evidence_citation: string;
    };
    quality_metrics: {
        variant_evidence: string;
        annotation_quality: string;
        database_certainty: string;
    };
}
/**
 * Advanced AI Module with Gemini LLM integration
 */
export declare function generatePatientReport(profileId: string, genes: any[]): Promise<PatientReport>;
//# sourceMappingURL=aiModule.d.ts.map