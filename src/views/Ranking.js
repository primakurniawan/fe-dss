import { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import Axios from 'axios'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CFormSelect,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'
import { useSelector } from 'react-redux'
import '@coreui/coreui/dist/css/coreui.min.css'

const Ranking = () => {
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
  const { selected } = useSelector((state) => state.categories)

  const getAlternativeRank = async (category_id) => {
    setVisible(false)
    const parameters_id = []
    for (const [, value] of Object.entries(criteria_idParameter_id)) {
      parameters_id.push(value)
    }
    const response = await Axios.get(
      `http://localhost:3000/alternatives/rank?parameters_id=[${parameters_id}]&category_id=${category_id}`,
    )
    setData(response.data.data)

    setRows(
      response.data.data.map((alternative) => {
        return {
          alternative_id: alternative.alternative_id,
          rank: alternative.rank,
          name: alternative.alternative_name,
          point: alternative.point,
        }
      }),
    )
  }

  const getParametersDetail = async (category_id) => {
    const response = await Axios.get(
      `http://localhost:3000/parameters/detail?category_id=${category_id}`,
    )
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

  const expandableComponent = (rows) => (
    <CListGroup flush>
      {data
        .filter((e) => e.alternative_id === rows.data.alternative_id)[0]
        ?.aspects.map((e) =>
          e.criteria.map((e, i) => (
            <CListGroupItem key={i}>
              {e.criteria_name}:{e.parameter.parameter_name}
            </CListGroupItem>
          )),
        )}
    </CListGroup>
  )
  useEffect(() => {
    getParametersDetail(selected)
  }, [selected])

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
      <CButton onClick={() => setVisible(true)} color="success" className="mb-3">
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
                  className="mb-3"
                  label={criteria.criteria_name}
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
          <CButton color="primary" onClick={() => getAlternativeRank(selected)}>
            Add Preference
          </CButton>
        </CModalFooter>
      </CModal>
      <DataTable
        columns={columns}
        data={rows}
        expandableRows
        expandableRowsComponent={expandableComponent}
        pagination
      />
    </>
  )
}

export default Ranking
