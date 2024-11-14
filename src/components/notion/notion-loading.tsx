import { LoadingIcon } from './loading-icon'
import styles from './styles.module.css'

export function NotionLoading() {
  return (
    <div className={styles.container}>
      <LoadingIcon />
    </div>
  )
}
