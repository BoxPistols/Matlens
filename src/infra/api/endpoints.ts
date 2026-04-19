// REST エンドポイント定数

const API_PREFIX = '/api/v1';

export const projectEndpoints = {
  list: `${API_PREFIX}/projects`,
  create: `${API_PREFIX}/projects`,
  detail: (id: string) => `${API_PREFIX}/projects/${id}`,
} as const;

export const specimenEndpoints = {
  list: `${API_PREFIX}/specimens`,
  create: `${API_PREFIX}/specimens`,
  detail: (id: string) => `${API_PREFIX}/specimens/${id}`,
  transition: (id: string) => `${API_PREFIX}/specimens/${id}/transition`,
} as const;

export const testEndpoints = {
  list: `${API_PREFIX}/tests`,
  create: `${API_PREFIX}/tests`,
  detail: (id: string) => `${API_PREFIX}/tests/${id}`,
  matrix: `${API_PREFIX}/tests/matrix`,
  conditionsScatter: `${API_PREFIX}/tests/conditions/scatter`,
} as const;

export const masterEndpoints = {
  testTypes: `${API_PREFIX}/test-types`,
  materials: `${API_PREFIX}/materials`,
  materialDetail: (id: string) => `${API_PREFIX}/materials/${id}`,
  standards: `${API_PREFIX}/standards`,
  customers: `${API_PREFIX}/customers`,
} as const;

export const damageEndpoints = {
  list: `${API_PREFIX}/damage`,
  detail: (id: string) => `${API_PREFIX}/damage/${id}`,
  similar: (id: string) => `${API_PREFIX}/damage/${id}/similar`,
} as const;

export const searchEndpoints = {
  semantic: `${API_PREFIX}/search/semantic`,
  similarImages: `${API_PREFIX}/search/similar-images`,
  suggestions: `${API_PREFIX}/search/suggestions`,
} as const;

export const dashboardEndpoints = {
  kpi: `${API_PREFIX}/dashboard/kpi`,
  activity: `${API_PREFIX}/dashboard/activity`,
  atRiskProjects: `${API_PREFIX}/dashboard/at-risk-projects`,
} as const;

export const toolEndpoints = {
  list: `${API_PREFIX}/tools`,
  create: `${API_PREFIX}/tools`,
  detail: (id: string) => `${API_PREFIX}/tools/${id}`,
} as const;

export const cuttingProcessEndpoints = {
  list: `${API_PREFIX}/cutting-processes`,
  create: `${API_PREFIX}/cutting-processes`,
  detail: (id: string) => `${API_PREFIX}/cutting-processes/${id}`,
  bySpecimen: (specimenId: string) =>
    `${API_PREFIX}/specimens/${specimenId}/cutting-processes`,
  waveforms: (id: string) => `${API_PREFIX}/cutting-processes/${id}/waveforms`,
} as const;
