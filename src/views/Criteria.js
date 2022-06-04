import { useEffect, useState } from 'react'
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
} from '@coreui/react'
import { useSelector } from 'react-redux'

const Criteria = () => {
  const [columns, setColumns] = useState()
  const [data, setData] = useState([])
  const [aspects, setAspects] = useState([])
  const [visible, setVisible] = useState({
    add: false,
    edit: {},
    delete: {},
  })

  const [input, setInput] = useState({
    aspect_id: 0,
    name: '',
    percentage: 0,
  })

  const { selected } = useSelector((state) => state.categories)

  const getCriteria = async (category_id) => {
    const response = await Axios.get(`http://localhost:3000/criteria?category_id=${category_id}`)
    const visible = {
      add: false,
      edit: {},
      delete: {},
    }
    await response.data.data.forEach((criteria) => {
      visible.edit[criteria.id] = false
      visible.delete[criteria.id] = false
    })
    setVisible((prevVisible) => {
      return {
        ...prevVisible,
        ...visible,
      }
    })
    setData(
      response.data.data.map((criteria) => {
        return {
          ...criteria,
          action: (
            <>
              <CButtonGroup
                role="group"
                aria-label="Basic action"
                key={`action_button_${criteria.id}`}
              >
                <CButton
                  color="warning"
                  onClick={() => {
                    setVisible((prevVisible) => ({
                      ...prevVisible,
                      edit: {
                        ...prevVisible.edit,
                        [criteria.id]: true,
                      },
                    }))
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
                        [criteria.id]: true,
                      },
                    }))
                  }}
                >
                  Delete
                </CButton>
              </CButtonGroup>
            </>
          ),
        }
      }),
    )
  }

  const addCriteria = async () => {
    const response = await Axios.post('http://localhost:3000/criteria', input)
    if (response.status === 201) {
      getCriteria(selected)
    }
  }

  const getAspects = async (category_id) => {
    const response = await Axios.get(`http://localhost:3000/aspects?category_id=${category_id}`)
    setAspects(response.data.data)
  }

  const editCriteria = async (id) => {
    const response = await Axios.patch(`http://localhost:3000/criteria/${id}`, input)
    if (response.status === 200) {
      getCriteria(selected)
    }
  }

  const deleteCriteria = async (id) => {
    const response = await Axios.delete(`http://localhost:3000/criteria/${id}`)
    if (response.status === 200) {
      getCriteria(selected)
    }
  }

  useEffect(() => {
    getCriteria(selected)
    getAspects(selected)
  }, [selected])

  useEffect(() => {
    let columns = []
    if (data.length > 0) {
      for (const [key] of Object.entries(data[0])) {
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
  }, [data])

  return (
    <>
      <CButton
        onClick={() => {
          setVisible({
            ...visible,
            add: true,
          })
        }}
        color="success"
      >
        Add Criteria
      </CButton>
      <CModal
        visible={visible.add}
        onClose={() => {
          setVisible({
            ...visible,
            add: false,
          })
        }}
      >
        <CModalHeader
          onClose={() => {
            setVisible({
              ...visible,
              add: false,
            })
          }}
        >
          <CModalTitle>Add New Criteria</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormSelect
            options={aspects.map((aspect) => ({
              value: aspect.id,
              label: aspect.name,
            }))}
            onChange={(e) => {
              setInput((prevInput) => ({
                ...prevInput,
                aspect_id: parseInt(e.target.value),
              }))
            }}
          />
          <CFormInput
            type="text"
            id="floatingName"
            floatingLabel="Criteria name"
            placeholder="Name"
            onChange={(e) => {
              setInput((prevInput) => ({
                ...prevInput,
                name: e.target.value,
              }))
            }}
          />
          <CFormInput
            type="number"
            id="floatingPercentage"
            floatingLabel="Criteria Percentage"
            placeholder="Percentage"
            min={0}
            max={100}
            onChange={(e) => {
              setInput((prevInput) => ({
                ...prevInput,
                percentage: parseInt(e.target.value),
              }))
            }}
          />
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              setVisible({
                ...visible,
                add: false,
              })
            }}
          >
            Close
          </CButton>
          <CButton color="primary" onClick={addCriteria}>
            Add New Criteria
          </CButton>
        </CModalFooter>
      </CModal>
      <DataTable columns={columns} data={data} pagination />

      {data.map((criteria) => {
        return (
          <div key={criteria.id}>
            <CModal
              visible={visible.edit[criteria.id]}
              onClose={() => {
                setVisible({
                  ...visible,
                  edit: {
                    ...visible.edit,
                    [criteria.id]: false,
                  },
                })
              }}
            >
              <CModalHeader
                onClose={() => {
                  setVisible({
                    ...visible,
                    edit: {
                      ...visible.edit,
                      [criteria.id]: false,
                    },
                  })
                }}
              >
                <CModalTitle>Edit Criteria</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CFormSelect
                  value={criteria.aspect_id}
                  options={aspects.map((aspect) => ({
                    value: aspect.id,
                    label: aspect.name,
                  }))}
                  onChange={(e) => {
                    setInput((prevInput) => ({
                      ...prevInput,
                      aspect_id: parseInt(e.target.value),
                    }))
                  }}
                />
                <CFormInput
                  type="text"
                  id="floatingName"
                  floatingLabel="Criteria name"
                  placeholder="Name"
                  onChange={(e) => {
                    setInput((prevInput) => ({
                      ...prevInput,
                      name: e.target.value,
                    }))
                  }}
                  defaultValue={criteria.name}
                />
                <CFormInput
                  type="number"
                  id="floatingPercentage"
                  floatingLabel="Criteria Percentage"
                  placeholder="Percentage"
                  min={0}
                  max={100}
                  onChange={(e) => {
                    setInput((prevInput) => ({
                      ...prevInput,
                      percentage: parseInt(e.target.value),
                    }))
                  }}
                  defaultValue={criteria.percentage}
                />
              </CModalBody>
              <CModalFooter>
                <CButton
                  color="secondary"
                  onClick={() => {
                    setVisible({
                      ...visible,
                      edit: {
                        ...visible.edit,
                        [criteria.id]: false,
                      },
                    })
                  }}
                >
                  Close
                </CButton>
                <CButton color="primary" onClick={editCriteria.bind(this, criteria.id)}>
                  Edit Criteria
                </CButton>
              </CModalFooter>
            </CModal>

            <CModal
              visible={visible.delete[criteria.id]}
              onClose={() => {
                setVisible({
                  ...visible,
                  delete: {
                    ...visible.delete,
                    [criteria.id]: false,
                  },
                })
              }}
            >
              <CModalHeader
                onClose={() => {
                  setVisible({
                    ...visible,
                    delete: {
                      ...visible.delete,
                      [criteria.id]: false,
                    },
                  })
                }}
              >
                <CModalTitle>Delete Criteria</CModalTitle>
              </CModalHeader>
              <CModalBody>Are you sure you want to delete {criteria.name}?</CModalBody>
              <CModalFooter>
                <CButton
                  color="secondary"
                  onClick={() => {
                    setVisible({
                      ...visible,
                      delete: {
                        ...visible.delete,
                        [criteria.id]: false,
                      },
                    })
                  }}
                >
                  Close
                </CButton>
                <CButton color="primary" onClick={deleteCriteria.bind(this, criteria.id)}>
                  Delete Criteria
                </CButton>
              </CModalFooter>
            </CModal>
          </div>
        )
      })}
    </>
  )
}

export default Criteria
