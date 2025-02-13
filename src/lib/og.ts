import satori from 'satori';
import sharp from 'sharp';

interface OgImageOptions {
  type?: 'home' | 'bet';
  title?: string;
  option1?: string;
  option2?: string;
  odds1?: string;
  odds2?: string;
  pool?: string;
}

export async function generateOgImage(options: OgImageOptions) {
  const { type = 'home', title, option1, option2, odds1, odds2, pool } = options;

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#030711',
          fontFamily: 'Inter',
          padding: '80px',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                marginBottom: '40px',
              },
              children: [
                {
                  type: 'span',
                  props: {
                    style: {
                      fontSize: '48px',
                      fontWeight: 'bold',
                      background: 'linear-gradient(to right, #10b981, #3b82f6)',
                      backgroundClip: 'text',
                      '-webkit-background-clip': 'text',
                      color: 'transparent',
                    },
                    children: 'Frenbet',
                  },
                },
              ],
            },
          },
          type === 'home'
            ? {
                type: 'div',
                props: {
                  style: {
                    fontSize: '64px',
                    fontWeight: 'bold',
                    color: '#fff',
                    textAlign: 'center',
                    marginBottom: '20px',
                  },
                  children: 'Place friendly bets with your friends',
                },
              }
            : {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '48px',
                          fontWeight: 'bold',
                          color: '#fff',
                          textAlign: 'center',
                          marginBottom: '40px',
                        },
                        children: title,
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '100%',
                          gap: '40px',
                        },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                flex: 1,
                                padding: '32px',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                              },
                              children: [
                                {
                                  type: 'span',
                                  props: {
                                    style: {
                                      fontSize: '32px',
                                      fontWeight: 'bold',
                                      color: '#fff',
                                      marginBottom: '16px',
                                    },
                                    children: option1,
                                  },
                                },
                                {
                                  type: 'span',
                                  props: {
                                    style: {
                                      fontSize: '24px',
                                      color: '#94a3b8',
                                    },
                                    children: odds1,
                                  },
                                },
                              ],
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                flex: 1,
                                padding: '32px',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                              },
                              children: [
                                {
                                  type: 'span',
                                  props: {
                                    style: {
                                      fontSize: '32px',
                                      fontWeight: 'bold',
                                      color: '#fff',
                                      marginBottom: '16px',
                                    },
                                    children: option2,
                                  },
                                },
                                {
                                  type: 'span',
                                  props: {
                                    style: {
                                      fontSize: '24px',
                                      color: '#94a3b8',
                                    },
                                    children: odds2,
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          marginTop: '40px',
                          fontSize: '32px',
                          color: '#94a3b8',
                        },
                        children: `Total Pool: $${pool}`,
                      },
                    },
                  ],
                },
              },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: await fetch(
            'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2'
          ).then((res) => res.arrayBuffer()),
        },
      ],
    }
  );

  const png = await sharp(Buffer.from(svg))
    .resize(1200, 630)
    .png()
    .toBuffer();

  return png;
}