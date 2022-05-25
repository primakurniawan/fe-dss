import { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import Axios from 'axios'
import {
  CButton,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CFormSelect,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'

const Rankings = () => {
  const [data, setData] = useState([])
  const [rows, setRows] = useState([])
  const [columns, setColumns] = useState()
  const [parametersDetail, setParametersDetail] = useState([])
  const [visible, setVisible] = useState(false)

  const [input, setInput] = useState({
    name: '',
    criteria_idParameter_id: {},
  })
  const [criteria_idParameter_id, setCriteria_idParameter_id] = useState({})
  const [name, setName] = useState('')

  const getAlternativeRank = async () => {
    const parameters_id = []
    for (const [, value] of Object.entries(criteria_idParameter_id)) {
      parameters_id.push(value)
    }

    const response = await Axios.post('http://localhost:3000/alternatives/rank', {
      parameters_id,
    })

    setData(response.data.rank)

    setRows(
      response.data.rank.map((alternative) => {
        return {
          alternative_id: alternative.alternative_id,
          rank: alternative.rank,
          name: alternative.alternative_name,
          point: alternative.point,
        }
      }),
    )
  }

  const getParametersDetail = async () => {
    const response = await Axios.get('http://localhost:3000/parameters/detail')
    setParametersDetail(response.data.data)

    const criteriaIdParameterId = {}
    response.data.data.forEach((aspect) => {
      aspect.criteria.forEach((criteria) => {
        criteriaIdParameterId[criteria.criteria_id] = criteria.parameters[0].id
      })
    })
    setCriteria_idParameter_id((prevState) => {
      return {
        ...prevState,
        ...criteriaIdParameterId,
      }
    })
  }

  const expandableComponent = (rows) => {
    return data
      .filter((e) => e.alternative_id === rows.data.alternative_id)[0]
      .aspects.map((e) => {
        return (
          <CListGroup key={e.aspect_id}>
            {e.criteria.map((e) => {
              return (
                <CListGroupItem key={e.id}>
                  {e.criteria_name}:{e.parameter.parameter_name}
                </CListGroupItem>
              )
            })}
          </CListGroup>
        )
      })
  }

  useEffect(() => {
    getParametersDetail()
  }, [])

  useEffect(() => {
    let columns = []
    if (rows.length > 0) {
      for (const [key] of Object.entries(rows[0])) {
        if (!key.includes('_id')) {
          columns.push({
            name: key.replace('_', ' ').toUpperCase(),
            selector: (row) => row[key],
            sortable: true,
          })
        }
      }
      setColumns(columns)
    }
  }, [rows])
  return (
    <>
      <CButton onClick={() => setVisible(true)} color="success">
        Add Preference
      </CButton>
      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader onClose={() => setVisible(false)}>
          <CModalTitle>Add Preference</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {parametersDetail.map((aspect) => {
            return aspect.criteria.map((criteria) => {
              return (
                <CFormSelect
                  key={criteria.criteria_id}
                  options={criteria.parameters.map((parameter) => {
                    return {
                      value: parameter.id,
                      label: parameter.name,
                    }
                  })}
                  onChange={(e) =>
                    setCriteria_idParameter_id((prevState) => ({
                      ...prevState,
                      [criteria.criteria_id]: parseInt(e.target.value),
                    }))
                  }
                />
              )
            })
          })}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={getAlternativeRank}>
            Add Preference
          </CButton>
        </CModalFooter>
      </CModal>
      <DataTable
        columns={columns}
        data={rows}
        expandableRows
        expandableRowsComponent={expandableComponent}
      />
    </>
  )
}

export default Rankings
