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
    guidance?: string; // Optional derived field for rapid scanning
    riskLevel?: "Toxic" | "Adjust Dose" | "Monitor" | "Safe" | "Unknown"; // For frontend convenience
}
