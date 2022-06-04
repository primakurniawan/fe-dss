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

const Parameter = () => {
  const [data, setData] = useState([])
  const [columns, setColumns] = useState([])
  const [criteria, setCriteria] = useState([])
  const [visible, setVisible] = useState({
    add: false,
    edit: {},
    delete: {},
  })
  const [input, setInput] = useState({
    criteria_id: 0,
    name: '',
    point: 0,
  })

  const { selected } = useSelector((state) => state.categories)

  const getParameter = async (category_id) => {
    const response = await Axios.get(`http://localhost:3000/parameters?category_id=${category_id}`)
    const visible = {
      add: false,
      edit: {},
      delete: {},
    }
    await response.data.data.forEach((parameter) => {
      visible.edit[parameter.id] = false
      visible.delete[parameter.id] = false
    })
    setVisible((prevVisible) => {
      return {
        ...prevVisible,
        ...visible,
      }
    })

    setData(
      response.data.data.map((parameter) => {
        return {
          ...parameter,
          action: (
            <>
              <CButtonGroup role="group" aria-label="Basic action">
                <CButton
                  color="warning"
                  onClick={() =>
                    setVisible((prevVisible) => ({
                      ...prevVisible,
                      edit: {
                        ...prevVisible.edit,
                        [parameter.id]: true,
                      },
                    }))
                  }
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
                        [parameter.id]: true,
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

  const addParameter = async () => {
    const response = await Axios.post('http://localhost:3000/parameters', input)
    if (response.status === 201) {
      getParameter(selected)
      setVisible({
        ...visible,
        add: true,
      })
    }
  }

  const getCriteria = async (category_id) => {
    const response = await Axios.get(`http://localhost:3000/criteria?category_id=${category_id}`)
    setCriteria(response.data.data)
  }

  const editParameter = async (id) => {
    const response = await Axios.patch(`http://localhost:3000/parameters/${id}`, input)
    if (response.status === 200) {
      getParameter(selected)
    }
  }

  const deleteParameter = async (id) => {
    const response = await Axios.delete(`http://localhost:3000/parameters/${id}`)
    if (response.status === 200) {
      getParameter(selected)
    }
  }

  useEffect(() => {
    getParameter(selected)
    getCriteria(selected)
  }, [selected])

  useEffect(() => {
    let columns = []
    if (data.length > 0) {
      for (const [key] of Object.entries(data[0])) {
        if (!key.includes('_id') && key !== 'id') {
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
        onClick={() =>
          setVisible({
            ...visible,
            add: true,
          })
        }
        color="success"
      >
        Add Parameter
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
          <CModalTitle>Add New Parameter</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormSelect
            options={criteria.map((criteria) => ({
              value: criteria.id,
              label: criteria.name,
            }))}
            onChange={(e) =>
              setInput((prevInput) => ({
                ...prevInput,
                criteria_id: parseInt(e.target.value),
              }))
            }
          />
          <CFormInput
            type="text"
            id="floatingName"
            floatingLabel="Parameter name"
            placeholder="Name"
            onChange={(e) =>
              setInput((prevInput) => ({
                ...prevInput,
                name: e.target.value,
              }))
            }
          />
          <CFormInput
            type="number"
            id="floatingPercentage"
            floatingLabel="Parameter Percentage"
            placeholder="Percentage"
            min={0}
            max={100}
            onChange={(e) =>
              setInput((prevInput) => ({
                ...prevInput,
                point: parseInt(e.target.value),
              }))
            }
          />
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
          <CButton color="primary" onClick={addParameter}>
            Add New Parameter
          </CButton>
        </CModalFooter>
      </CModal>
      <DataTable columns={columns} data={data} pagination />

      {data.map((parameter, i) => {
        return (
          <div key={i}>
            <CModal
              visible={visible.edit[parameter.id]}
              onClose={() =>
                setVisible((prevVisible) => ({
                  ...prevVisible,
                  edit: {
                    ...prevVisible.edit,
                    [parameter.id]: false,
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
                      [parameter.id]: false,
                    },
                  }))
                }
              >
                <CModalTitle>Edit Parameter</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CFormInput
                  type="text"
                  id="floatingName"
                  floatingLabel="Parameter name"
                  placeholder="Name"
                  onChange={(e) =>
                    setInput((prevInput) => ({
                      ...prevInput,
                      name: e.target.value,
                    }))
                  }
                  defaultValue={parameter.name}
                />
                <CFormInput
                  type="number"
                  id="floatingPercentage"
                  floatingLabel="Parameter Percentage"
                  placeholder="Percentage"
                  min={0}
                  max={100}
                  onChange={(e) =>
                    setInput((prevInput) => ({
                      ...prevInput,
                      point: parseInt(e.target.value),
                    }))
                  }
                  defaultValue={parameter.point}
                />
              </CModalBody>
              <CModalFooter>
                <CButton
                  color="secondary"
                  onClick={() =>
                    setVisible((prevVisible) => ({
                      ...prevVisible,
                      edit: {
                        ...prevVisible.edit,
                        [parameter.id]: false,
                      },
                    }))
                  }
                >
                  Close
                </CButton>
                <CButton color="primary" onClick={editParameter.bind(this, parameter.id)}>
                  Edit Parameter
                </CButton>
              </CModalFooter>
            </CModal>

            <CModal
              visible={visible.delete[parameter.id]}
              onClose={() =>
                setVisible({
                  ...visible,
                  delete: {
                    ...visible.delete,
                    [parameter.id]: false,
                  },
                })
              }
            >
              <CModalHeader
                onClose={() => {
                  setVisible({
                    ...visible,
                    delete: {
                      ...visible.delete,
                      [parameter.id]: false,
                    },
                  })
                }}
              >
                <CModalTitle>Delete Parameter</CModalTitle>
              </CModalHeader>
              <CModalBody>Are you sure you want to delete {parameter.name}?</CModalBody>
              <CModalFooter>
                <CButton
                  color="secondary"
                  onClick={() => {
                    setVisible({
                      ...visible,
                      delete: {
                        ...visible.delete,
                        [parameter.id]: false,
                      },
                    })
                  }}
                >
                  Close
                </CButton>
                <CButton color="primary" onClick={deleteParameter.bind(this, parameter.id)}>
                  Delete Parameter
                </CButton>
              </CModalFooter>
            </CModal>
          </div>
        )
      })}
    </>
  )
}

export default Parameter
