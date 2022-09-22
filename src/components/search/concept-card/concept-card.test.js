import { render, fireEvent, waitFor } from '@testing-library/react'
import { ConceptCard } from './concept-card'
import { HelxSearch } from '../'
import { ContextProviders } from '../../../app'
import { AnalyticsContext, mockConcepts } from '../../../__mocks__/'
import { AnalyticsProvider, EnvironmentProvider } from '../../../contexts'

describe("ConceptCard", () => {
    const mockConcept = Object.values(mockConcepts)[0]
    let utils
    beforeEach(async () => {
        utils = render(
            <EnvironmentProvider>
                <AnalyticsProvider>
                    <HelxSearch>
                        <ConceptCard
                            result={ mockConcept.concept }
                            openModalHandler={ () => {} }
                        />
                    </HelxSearch>
                </AnalyticsProvider>
            </EnvironmentProvider>
        )
        await waitFor(() => expect(utils.container).not.toHaveClass("ant-spin"))
    })
    it("renders overview", () => {
        const { container } = utils
        expect(container).toHaveTextContent(mockConcept.concept.name)
        expect(container).toHaveTextContent(mockConcept.concept.description)
    })
    it("renders studies", async () => {
        const { container, getByText } = utils
        fireEvent.click(getByText(/^Studies$/))
        for (const study of Object.values(mockConcept.studies).flat()) {
            await waitFor(() => expect(container).toHaveTextContent(study.c_name))
        }
    })
})