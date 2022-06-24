import React, { useCallback, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CHeader,
  CHeaderBrand,
  CHeaderNav,
  CNavLink,
  CNavItem,
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { logo } from 'src/assets/brand/logo'
import { change, get } from 'src/categoriesSlice'
import axios from 'axios'

const AppHeader = () => {
  const dispatch = useDispatch()
  const categories = useSelector((state) => state.categories)
  const getCategories = useCallback(async () => {
    const response = await axios.get(`http://localhost:3000/categories`)
    dispatch(get(response.data.data))
    dispatch(change(response.data.data[0].id))
  }, [dispatch])
  useEffect(() => {
    getCategories()
  }, [getCategories])

  return (
    <CHeader position="sticky" className="mb-4">
      <CContainer>
        <CHeaderBrand className="mx-auto d-md-none" to="/">
          <img src="src\assets\images\logo_usu.png" height={48} alt="Logo" />
        </CHeaderBrand>
        <CHeaderNav className="d-none d-md-flex me-auto">
          <CNavItem>
            <CFormSelect
              size="sm"
              // floatingLabel="categories"
              options={categories.items.map((e) => {
                return {
                  value: e.id,
                  label: e.name,
                }
              })}
              defaultValue={categories.selected}
              onChange={(e) => dispatch(change(parseInt(e.target.value)))}
            />
          </CNavItem>
          <CNavItem>
            <CNavLink to="/alternatives" component={NavLink}>
              Alternatives
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink to="/aspects" component={NavLink}>
              Aspects
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink to="/criteria" component={NavLink}>
              Criteria
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink to="/parameters" component={NavLink}>
              Parameters
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink to="/ranking" component={NavLink}>
              Ranking
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink to="/stores" component={NavLink}>
              Stores
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink to="/shortest" component={NavLink}>
              Shortest
            </CNavLink>
          </CNavItem>
        </CHeaderNav>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
