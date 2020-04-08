import cv2

img = cv2.imread("icon-fence.png", cv2.IMREAD_UNCHANGED)
dst = img.copy()
dst[:,:,0] = img[:,:,2]
dst[:,:,2] = img[:,:,0]
cv2.imwrite("icon-polygons.png", dst)