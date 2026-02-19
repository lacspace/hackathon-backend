export interface IProfile {
    _id?: string;
    name: string;
    timestamp: Date;
    genes: IGeneResult[];
}
export interface IGeneResult {
    gene: string;
    rsID: string;
    genotype: string;
    phenotype: string;
    rawGT?: string;
    guidance?: string;
    riskLevel?: "Toxic" | "Adjust Dose" | "Monitor" | "Safe" | "Unknown";
}
//# sourceMappingURL=index.d.ts.map