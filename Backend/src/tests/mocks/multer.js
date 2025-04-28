// const multer = jest.fn(() => {
//   console.log("Multer mock called");
//   return {
//     fields: jest.fn(() => (req, res, next) => {
//       req.files = {
//         profileImage: [{ filename: `profile-${Date.now()}.jpg` }],
//         farmImage: [{ filename: `farm-${Date.now()}.jpg` }],
//       };
//       next();
//     }),
//     diskStorage: jest.fn(() => ({
//       destination: jest.fn(),
//       filename: jest.fn(),
//     })),
//   };
// });

// module.exports = multer;
