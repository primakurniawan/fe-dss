import { useEffect, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import Axios from 'axios'
import {
  CButton,
  CButtonGroup,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CFormSelect,
  CListGroup,
  CListGroupItem,
  CForm,
} from '@coreui/react'
const { useSelector } = require('react-redux')

import '@coreui/coreui/dist/css/coreui.min.css'

const Alternatives = () => {
  const [data, setData] = useState([])
  const [rows, setRows] = useState([])
  const [columns, setColumns] = useState()
  const [parametersDetail, setParametersDetail] = useState([])
  const [visible, setVisible] = useState({
    add: false,
    edit: {},
    delete: {},
  })

  const [criteria_idParameter_id, setCriteria_idParameter_id] = useState({})
  const [name, setName] = useState('')
  const form = useRef(null)

  const { selected } = useSelector((state) => state.categories)

  const getAlternative = async (category_id) => {
    const response = await Axios.get(
      `http://localhost:3000/alternatives?category_id=${category_id}`,
    )
    const visible = {
      add: false,
      edit: {},
      delete: {},
    }
    await response.data.data.forEach((alternative) => {
      visible.edit[alternative.id] = false
      visible.delete[alternative.id] = false
    })
    setVisible((prevVisible) => {
      return {
        ...prevVisible,
        ...visible,
      }
    })

    setData((prevState) => response.data.data)

    setRows(
      response.data.data.map((alternative) => {
        return {
          alternative_id: alternative.alternative_id,
          name: alternative.alternative_name,
          action: (
            <CButtonGroup role="group" aria-label="Basic action" key={alternative.alternative_id}>
              <CButton
                color="warning"
                onClick={() => {
                  setVisible((prevVisible) => ({
                    ...prevVisible,
                    edit: {
                      ...prevVisible.edit,
                      [alternative.alternative_id]: true,
                    },
                  }))
                  setName(alternative.alternative_name)
                  console.log(alternative)
                  const criteriaIdParameterId = {}
                  alternative.aspects.forEach((e) => {
                    e.criteria.forEach((criteria) => {
                      criteriaIdParameterId[criteria.criteria_id] = criteria.parameter.id
                    })
                  })
                  setCriteria_idParameter_id(criteriaIdParameterId)
                }}
              >
                Edit
              </CButton>

              <CButton
                color="danger"
                onClick={() => {
                  setVisible((prevVisible) => ({
                    ...prevVisible,
                    delete: {
                      ...prevVisible.delete,
                      [alternative.alternative_id]: true,
                    },
                  }))
                }}
              >
                Delete
              </CButton>
            </CButtonGroup>
          ),
        }
      }),
    )
  }

  const addAlternative = async (event) => {
    const parameters_id = []
    for (const [, value] of Object.entries(criteria_idParameter_id)) {
      parameters_id.push(value)
    }
    const response = await Axios.post(
      `http://localhost:3000/alternatives?category_id=${selected}`,
      {
        name,
        parameters_id,
      },
    )
    if (response.status === 201) {
      getAlternative(selected)
    }
  }

  const getParametersDetail = async (category_id) => {
    const response = await Axios.get(
      `http://localhost:3000/parameters/detail?category_id=${category_id}`,
    )
    setParametersDetail(response.data.data)

    response.data.data.forEach((aspect) => {
      aspect.criteria.forEach((criteria) => {
        setCriteria_idParameter_id((prevState) => {
          return {
            ...prevState,
            [criteria.criteria_id]: criteria.parameters[0].id,
          }
        })
      })
    })
  }

  const editAlternative = async (id) => {
    const parameters_id = []
    for (const [, value] of Object.entries(criteria_idParameter_id)) {
      parameters_id.push(value)
    }
    const response = await Axios.patch(`http://localhost:3000/alternatives/${id}`, {
      name,
      parameters_id,
    })
    if (response.status === 200) {
      getAlternative(selected)
    }
  }

  const deleteAlternative = async (id) => {
    const response = await Axios.delete(`http://localhost:3000/alternatives/${id}`)
    if (response.status === 200) {
      getAlternative(selected)
    }
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
    getAlternative(selected)
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
      <CButton
        onClick={() =>
          setVisible({
            ...visible,
            add: true,
          })
        }
        color="success"
        className="mb-3"
      >
        Add Alternative
      </CButton>
      <CModal
        visible={visible.add}
        onClose={() =>
          setVisible({
            ...visible,
            add: false,
          })
        }
      >
        <CModalHeader
          onClose={() =>
            setVisible({
              ...visible,
              add: false,
            })
          }
        >
          <CModalTitle>Add New Alternative</CModalTitle>
        </CModalHeader>
        <CForm ref={form} onSubmit={addAlternative}>
          <CModalBody>
            <CFormInput
              className="mb-3"
              type="text"
              id="floatingName"
              floatingLabel="Alternative name"
              placeholder="Name"
              onChange={(e) => setName(e.target.value)}
              size="sm"
              required
            />
            {parametersDetail.map((aspect) => {
              return aspect.criteria.map((criteria) => {
                return (
                  <CFormSelect
                    className="mb-3"
                    size="sm"
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
            <CButton
              color="secondary"
              onClick={() =>
                setVisible({
                  ...visible,
                  add: false,
                })
              }
            >
              Close
            </CButton>
            <CButton color="primary" type="submit">
              Add New Alternative
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
      <DataTable
        columns={columns}
        data={rows}
        expandableRows
        expandableRowsComponent={expandableComponent}
        pagination
      />

      {rows.map((alternative) => {
        return (
          <div key={alternative.alternative_id}>
            <CModal
              visible={visible.edit[alternative.alternative_id]}
              onClose={() =>
                setVisible((prevVisible) => ({
                  ...prevVisible,
                  edit: {
                    ...prevVisible.edit,
                    [alternative.alternative_id]: false,
                  },
                }))
              }
            >
              <CModalHeader
                onClose={() =>
                  setVisible((prevVisible) => ({
                    ...prevVisible,
                    edit: {
                      ...prevVisible.edit,
                      [alternative.alternative_id]: false,
                    },
                  }))
                }
              >
                <CModalTitle>Edit Alternative</CModalTitle>
              </CModalHeader>
              <CForm onSubmit={() => editAlternative(alternative.alternative_id)}>
                <CModalBody>
                  <CFormInput
                    className="mb-3"
                    type="text"
                    id="floatingName"
                    floatingLabel="Alternative name"
                    placeholder="Name"
                    onChange={(e) => setName(e.target.value)}
                    defaultValue={alternative.name}
                    required
                  />
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
                          defaultValue={
                            data
                              .filter((e) => e.alternative_id === alternative.alternative_id)[0]
                              ?.aspects.filter((e) => e.aspect_id === aspect.aspect_id)[0]
                              ?.criteria.filter((e) => e.criteria_id === criteria.criteria_id)[0]
                              ?.parameter.parameter_id
                          }
                        />
                      )
                    })
                  })}{' '}
                </CModalBody>
                <CModalFooter>
                  <CButton
                    color="secondary"
                    onClick={() =>
                      setVisible((prevVisible) => ({
                        ...prevVisible,
                        edit: {
                          ...prevVisible.edit,
                          [alternative.alternative_id]: false,
                        },
                      }))
                    }
                  >
                    Close
                  </CButton>
                  <CButton color="primary" type="submit">
                    Edit Alternative
                  </CButton>
                </CModalFooter>
              </CForm>
            </CModal>

            <CModal
              visible={visible.delete[alternative.alternative_id]}
              onClose={() =>
                setVisible((prevVisible) => ({
                  ...prevVisible,
                  delete: {
                    ...prevVisible.delete,
                    [alternative.alternative_id]: false,
                  },
                }))
              }
            >
              <CModalHeader
                onClose={() =>
                  setVisible((prevVisible) => ({
                    ...prevVisible,
                    delete: {
                      ...prevVisible.delete,
                      [alternative.alternative_id]: false,
                    },
                  }))
                }
              >
                <CModalTitle>Delete Alternative</CModalTitle>
              </CModalHeader>
              <CModalBody>Are you sure you want to delete {alternative.name}?</CModalBody>
              <CModalFooter>
                <CButton
                  color="secondary"
                  onClick={() =>
                    setVisible((prevVisible) => ({
                      ...prevVisible,
                      delete: {
                        ...prevVisible.delete,
                        [alternative.alternative_id]: false,
                      },
                    }))
                  }
                >
                  Close
                </CButton>
                <CButton
                  color="primary"
                  onClick={deleteAlternative.bind(this, alternative.alternative_id)}
                >
                  Delete Alternative
                </CButton>
              </CModalFooter>
            </CModal>
          </div>
        )
      })}
    </>
  )
}

export default Alternatives
