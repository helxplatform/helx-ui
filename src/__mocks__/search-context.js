import { useState } from 'react'
import fetch from 'jest-fetch-mock'

export const mockConcepts = {
    asthma: {
        concept: {
            "id":"MONDO:0005405",
            "name":"childhood onset asthma",
            "description":"Asthma that starts in childhood.",
            "type":"disease",
            "search_terms":["childhood asthma","asthma of childhood","pediatric asthma"],
            "optional_terms":["childhood onset asthma","Childhood onset","Pediatric onset","Clinical course"],
            "concept_action":"",
            "identifiers": [
                {"id":"MONDO:0005405","label":"childhood onset asthma","equivalent_identifiers":["MONDO:0005405","UMLS:C0264408","MEDDRA:10081274","SNOMEDCT:233678006"],"type":["biolink:Disease","biolink:DiseaseOrPhenotypicFeature","biolink:BiologicalEntity","biolink:NamedThing","biolink:Entity","biolink:ThingWithTaxon"],"synonyms":["asthma of childhood","childhood asthma","pediatric asthma"]}
            ]
        },
        studies: {"DbGaP":[{"c_id":"phs001602.v1.p1","c_link":"https://www.ncbi.nlm.nih.gov/projects/gap/cgi-bin/study.cgi?study_id=phs001602.v1.p1","c_name":"TOPMed_WGS_ChildrensHS_GAP_Subject_Phenoyptes","elements":[{"description":"childhood asthma case or control","e_link":"https://www.ncbi.nlm.nih.gov/projects/gap/cgi-bin/variable.cgi?study_id=phs001602.v1.p1&phv=00427574","id":"phv00427574.v1.p1","name":"Affection_Status","score":183.33922}]},{"c_id":"phs001603.v1.p1","c_link":"https://www.ncbi.nlm.nih.gov/projects/gap/cgi-bin/study.cgi?study_id=phs001603.v1.p1","c_name":"TOPMed_WGS_ChildrensHS_IGERA_Subject_Phenoyptes","elements":[{"description":"childhood asthma case or control","e_link":"https://www.ncbi.nlm.nih.gov/projects/gap/cgi-bin/variable.cgi?study_id=phs001603.v1.p1&phv=00427530","id":"phv00427530.v1.p1","name":"Affection_Status","score":183.33922}]},{"c_id":"phs001604.v1.p1","c_link":"https://www.ncbi.nlm.nih.gov/projects/gap/cgi-bin/study.cgi?study_id=phs001604.v1.p1","c_name":"TOPMed_WGS_ChildrensHS_MetaAir_Subject_Phenoyptes","elements":[{"description":"childhood asthma case or control","e_link":"https://www.ncbi.nlm.nih.gov/projects/gap/cgi-bin/variable.cgi?study_id=phs001604.v1.p1&phv=00427613","id":"phv00427613.v1.p1","name":"Affection_Status","score":183.33922}]}]},
        knowledgeGraphs: {"hits":{"hits":[{"_type":"_doc","_id":"MONDO:0005405_MONDO:0005405_HP:0011463_disease","_source":{"concept_id":"MONDO:0005405","search_targets":["childhood onset asthma","Childhood onset"],"knowledge_graph":{"knowledge_map":[{"node_bindings":{"disease":["MONDO:0005405"],"phenotypic_feature":["HP:0011463"]},"edge_bindings":{"e1_disease_phenotypic_feature":["0009db6f2f2cd65848a801bc763ad6a8"]}}],"knowledge_graph":{"nodes":[{"id":"MONDO:0005405","name":"childhood onset asthma","synonyms":null},{"id":"HP:0011463","name":"Childhood onset","synonyms":null}],"edges":[{"relation":["RO:0002573"],"predicate_label":"related to","reasoner":["redis:test"],"subject":"MONDO:0005405","object":"HP:0011463","predicate":"biolink:related_to","id":"0009db6f2f2cd65848a801bc763ad6a8","publications":[],"type":"biolink:related_to","source_id":"MONDO:0005405","target_id":"HP:0011463"}]},"question_graph":{"nodes":[{"id":"disease","type":["b","i","o","l","i","n","k","_","D","i","s","e","a","s","e"],"curie":["MONDO:0005405"]},{"id":"phenotypic_feature","type":["b","i","o","l","i","n","k","_","P","h","e","n","o","t","y","p","i","c","F","e","a","t","u","r","e"]}],"edges":[{"id":"e1_disease_phenotypic_feature","source_id":"disease","target_id":"phenotypic_feature"}]}}}},{"_type":"_doc","_id":"MONDO:0005405_MONDO:0005405_HP:0410280_disease","_source":{"concept_id":"MONDO:0005405","search_targets":["childhood onset asthma","Pediatric onset"],"knowledge_graph":{"knowledge_map":[{"node_bindings":{"disease":["MONDO:0005405"],"phenotypic_feature":["HP:0410280"]},"edge_bindings":{"e1_disease_phenotypic_feature":["0095243a3fd5b4b146925daff0fe1480"]}}],"knowledge_graph":{"nodes":[{"id":"MONDO:0005405","name":"childhood onset asthma","synonyms":null},{"id":"HP:0410280","name":"Pediatric onset","synonyms":null}],"edges":[{"relation":["RO:0002573"],"predicate_label":"related to","reasoner":["redis:test"],"subject":"MONDO:0005405","object":"HP:0410280","predicate":"biolink:related_to","id":"0095243a3fd5b4b146925daff0fe1480","publications":[],"type":"biolink:related_to","source_id":"MONDO:0005405","target_id":"HP:0410280"}]},"question_graph":{"nodes":[{"id":"disease","type":["b","i","o","l","i","n","k","_","D","i","s","e","a","s","e"],"curie":["MONDO:0005405"]},{"id":"phenotypic_feature","type":["b","i","o","l","i","n","k","_","P","h","e","n","o","t","y","p","i","c","F","e","a","t","u","r","e"]}],"edges":[{"id":"e1_disease_phenotypic_feature","source_id":"disease","target_id":"phenotypic_feature"}]}}}},{"_type":"_doc","_id":"MONDO:0005405_MONDO:0005405_HP:0031797_disease","_source":{"concept_id":"MONDO:0005405","search_targets":["childhood onset asthma","Clinical course"],"knowledge_graph":{"knowledge_map":[{"node_bindings":{"disease":["MONDO:0005405"],"phenotypic_feature":["HP:0031797"]},"edge_bindings":{"e1_disease_phenotypic_feature":["d7353e003f8e531686f35a5da3a7fb21"]}}],"knowledge_graph":{"nodes":[{"id":"MONDO:0005405","name":"childhood onset asthma","synonyms":null},{"id":"HP:0031797","name":"Clinical course","synonyms":null}],"edges":[{"relation":["RO:0002573"],"predicate_label":"related to","reasoner":["redis:test"],"subject":"MONDO:0005405","object":"HP:0031797","predicate":"biolink:related_to","id":"d7353e003f8e531686f35a5da3a7fb21","publications":[],"type":"biolink:related_to","source_id":"MONDO:0005405","target_id":"HP:0031797"}]},"question_graph":{"nodes":[{"id":"disease","type":["b","i","o","l","i","n","k","_","D","i","s","e","a","s","e"],"curie":["MONDO:0005405"]},{"id":"phenotypic_feature","type":["b","i","o","l","i","n","k","_","P","h","e","n","o","t","y","p","i","c","F","e","a","t","u","r","e"]}],"edges":[{"id":"e1_disease_phenotypic_feature","source_id":"disease","target_id":"phenotypic_feature"}]}}}}]},"total_items":3}
    }
}

export const mockHelxSearch = () => {
    jest.mock("@reach/router", () => ({
        useLocation: () => ({}),
        useNavigate: jest.fn()
    }))
    registerAxiosMock({
        config: {
            url: /.*\/search_var/,
            method: "POST"
        },
        response: (config) => {
            const activeMock = Object.values(mockConcepts).find((mock) => mock.concept.id === config.data.concept)
            if (activeMock) return {
                status: 200,
                data: {
                    message: "Search result",
                    result: activeMock.studies,
                    status: "success"
                }
            }
            throw new Error(`Could not find mock on /search_var for ${config.data.concept}`)
        }
    })
    // fetch.mockResponse(async (request) => {
    //     const url = new URL(request.url)
    //     if (request.url.endsWith("/search_var")) {
    //         const body = await request.json()
    //         const activeMock = mocks.find((mock) => mock.id === body.concept)
    //         if (activeMock) return {
    //             message: "Search result",
    //             result: mock.studies,
    //             status: "success"
    //         }
    //     }
    //     if (request.url.endsWith("/search_kg")) {
    //         const body = await request.json()
    //         const activeMock = mocks.find((mock) => mock.id === body.unique_id)
    //         if (activeMock) return {
    //             message: "Search result",
    //             result: mock.knowledgeGraphs,
    //             status: "success"
    //         }
    //     }
    // })
}