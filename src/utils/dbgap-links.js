const DB_GAP_VARIABLE_URL = `https://www.ncbi.nlm.nih.gov/projects/gap/cgi-bin/variable.cgi`
const DB_GAP_STUDY_URL = `https://www.ncbi.nlm.nih.gov/projects/gap/cgi-bin/study.cgi`

export const dbGapLink = {
  variable: (studyId, variable) => {
      // variable always has the form "phv987654321.v12.p23"
      // and the "987654321" portion is used in the dbGap link
      const matches = variable.match(/phv(\d+)\.v\d+\.p\d+$/)
      if (matches) {
          const [, variableDigits] = matches
          return variableDigits ? `${ DB_GAP_VARIABLE_URL }?study_id=${ studyId }&phv=${ variableDigits }` : `${ DB_GAP_VARIABLE_URL }?studyId=${ studyId }&phv=${ variable }`
      } else {
          return null
      }
  },
  study: studyId => `${ DB_GAP_STUDY_URL }?study_id=${ studyId }`,
}